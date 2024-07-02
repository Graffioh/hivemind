package repository

import (
	"database/sql"
	"fmt"
	"log"
	"server-hivemind/models"
)

type ReactionRepository struct {
	db *sql.DB
}

func NewReactionRepository(db *sql.DB) *ReactionRepository {
	return &ReactionRepository{db: db}
}

type DuplicateReactionError struct {
	UserID    int
	PostID    int
	CommentID int
}

func (e *DuplicateReactionError) Error() string {
	if e.PostID != 0 {
		return fmt.Sprintf("User %d has already reacted to post %d", e.UserID, e.PostID)
	}
	return fmt.Sprintf("User %d has already reacted to comment %d", e.UserID, e.CommentID)
}

func (r *ReactionRepository) GetPostReactionsCount(post_id int) (*models.ReactionCounts, error) {
	var counts models.ReactionCounts
	query := `
		SELECT 
			SUM(CASE WHEN reaction = 1 THEN 1 ELSE 0 END) as upvotes,
			SUM(CASE WHEN reaction = -1 THEN 1 ELSE 0 END) as downvotes
		FROM reactions 
		WHERE post_id = $1 AND reaction_type = 'post'
	`
	err := r.db.QueryRow(query, post_id).Scan(&counts.Upvotes, &counts.Downvotes)
	if err != nil {
		log.Printf("Error querying post reaction counts: %v", err)
		return nil, err
	}
	return &counts, nil
}

func (r *ReactionRepository) GetCommentReactionsCount(comment_id int) (*models.ReactionCounts, error) {
	var reaction_counts models.ReactionCounts
	query := `
		SELECT 
			SUM(CASE WHEN reaction = 1 THEN 1 ELSE 0 END) as upvotes,
			SUM(CASE WHEN reaction = -1 THEN 1 ELSE 0 END) as downvotes
		FROM reactions 
		WHERE comment_id = $1 AND reaction_type = 'comment'
	`
	err := r.db.QueryRow(query, comment_id).Scan(&reaction_counts.Upvotes, &reaction_counts.Downvotes)
	if err != nil {
		log.Printf("Error querying reaction counts: %v", err)
		return nil, err
	}
	return &reaction_counts, nil
}

func (r *ReactionRepository) GetUserReactionToPost(post_id int, user_id int) (*int, error) {
	var reaction_value *int

	row := r.db.QueryRow("SELECT reaction FROM reactions WHERE post_id = $1 AND user_id = $2 AND reaction_type = 'post';", post_id, user_id)
	err := row.Scan(&reaction_value)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		log.Printf("Error querying reaction: %v", err)
		return nil, err
	}

	return reaction_value, nil
}

func (r *ReactionRepository) GetUserReactionToComment(comment_id int, user_id int) (*int, error) {
	var reaction_value *int

	row := r.db.QueryRow("SELECT reaction FROM reactions WHERE comment_id = $1 AND user_id = $2 AND reaction_type = 'comment';", comment_id, user_id)
	err := row.Scan(&reaction_value)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		log.Printf("Error querying reaction: %v", err)
		return nil, err
	}

	return reaction_value, nil
}

func (r *ReactionRepository) UpdatePostReactionsCount(reaction models.Reaction) error {
	query := `
        WITH reaction_counts AS (
            SELECT 
                SUM(CASE WHEN reaction = 1 THEN 1 ELSE 0 END) as upvotes,
                SUM(CASE WHEN reaction = -1 THEN 1 ELSE 0 END) as downvotes
            FROM reactions 
            WHERE post_id = $1 AND reaction_type = 'post'
        )
        UPDATE posts p
        SET up_vote = rc.upvotes, down_vote = rc.downvotes
        FROM reaction_counts rc
        WHERE p.id = $1
    `

	_, err := r.db.Exec(query, reaction.PostID)
	if err != nil {
		log.Printf("Error updating post reaction counts: %v", err)
		return err
	}

	return nil
}

func (r *ReactionRepository) UpdateCommentReactionsCount(reaction models.Reaction) error {
	query := `
        WITH reaction_counts AS (
            SELECT 
                SUM(CASE WHEN reaction = 1 THEN 1 ELSE 0 END) as upvotes,
                SUM(CASE WHEN reaction = -1 THEN 1 ELSE 0 END) as downvotes
            FROM reactions 
            WHERE comment_id = $1 AND reaction_type = 'comment'
        )
        UPDATE comments c
        SET up_vote = rc.upvotes, down_vote = rc.downvotes
        FROM reaction_counts rc
        WHERE c.id = $1
    `

	_, err := r.db.Exec(query, reaction.CommentID)
	if err != nil {
		log.Printf("Error updating reaction counts: %v", err)
		return err
	}

	return nil
}

func (r *ReactionRepository) CreateReaction(reaction models.Reaction) (*models.Reaction, error) {
	var err error
	var existingReaction models.Reaction

	// Check if a reaction from the user already exists for the given post or comment
	err = r.db.QueryRow(
		"SELECT id, reaction FROM reactions WHERE user_id = $1 AND (post_id = $2 OR comment_id = $3)",
		reaction.UserID, reaction.PostID, reaction.CommentID,
	).Scan(&existingReaction.ID, &existingReaction.ReactionValue)

	switch {
	case err == sql.ErrNoRows:
		// No existing reaction found, insert a new one
		stmt, err := r.db.Prepare(
			"INSERT INTO reactions(user_id, post_id, comment_id, reaction_type, reaction, created_at) " +
				"VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
		)
		if err != nil {
			log.Printf("Error preparing statement: %v", err)
			return nil, err
		}
		defer stmt.Close()

		var queryErr error
		if reaction.ReactionType == "post" {
			queryErr = stmt.QueryRow(
				reaction.UserID, reaction.PostID, nil, reaction.ReactionType, reaction.ReactionValue, reaction.CreatedAt,
			).Scan(&reaction.ID)
		} else {
			queryErr = stmt.QueryRow(
				reaction.UserID, nil, reaction.CommentID, reaction.ReactionType, reaction.ReactionValue, reaction.CreatedAt,
			).Scan(&reaction.ID)
		}

		if queryErr != nil {
			log.Printf("Error executing statement: %v", queryErr)
			return nil, queryErr
		}

	case err == nil:
		var reactionValue int
		// Handle vote reset
		if existingReaction.ReactionValue == reaction.ReactionValue {
			reactionValue = 0
		} else {
			reactionValue = reaction.ReactionValue
		}

		// Update the existing reaction
		stmt, err := r.db.Prepare(
			"UPDATE reactions SET reaction = $1 WHERE id = $2",
		)
		if err != nil {
			log.Printf("Error preparing update statement: %v", err)
			return nil, err
		}
		defer stmt.Close()

		_, err = stmt.Exec(reactionValue, existingReaction.ID)
		if err != nil {
			log.Printf("Error executing update statement: %v", err)
			return nil, err
		}

		reaction.ID = existingReaction.ID

	default:
		// Other errors
		return nil, err
	}

	if reaction.ReactionType == "post" {
		err = r.UpdatePostReactionsCount(reaction)

		if err != nil {
			log.Printf("Error updating post reactions count: %v", err)
			return nil, err
		}
	} else {
		err = r.UpdateCommentReactionsCount(reaction)

		if err != nil {
			log.Printf("Error updating comment reactions count: %v", err)
			return nil, err
		}
	}

	return &reaction, nil
}

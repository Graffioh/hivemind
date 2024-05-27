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

func (r *ReactionRepository) GetPostReactions(post_id int) (*models.ReactionCounts, error) {
	var counts models.ReactionCounts

	row := r.db.QueryRow("SELECT COUNT(*) FROM reactions WHERE post_id = $1 AND reaction_type = 'post' AND reaction = 1;", post_id)
	if err := row.Scan(&counts.Upvotes); err != nil {
		log.Printf("Error querying upvotes: %v", err)
		return nil, err
	}

	row = r.db.QueryRow("SELECT COUNT(*) FROM reactions WHERE post_id = $1 AND reaction_type = 'post' AND reaction = -1;", post_id)
	if err := row.Scan(&counts.Downvotes); err != nil {
		log.Printf("Error querying downvotes: %v", err)
		return nil, err
	}

	return &counts, nil
}

func (r *ReactionRepository) GetCommentReactions(comment_id int) (*models.ReactionCounts, error) {
	var counts models.ReactionCounts

	row := r.db.QueryRow("SELECT COUNT(*) FROM reactions WHERE comment_id = $1 AND reaction_type = 'comment' AND reaction = 1;", comment_id)
	if err := row.Scan(&counts.Upvotes); err != nil {
		log.Printf("Error querying upvotes: %v", err)
		return nil, err
	}

	row = r.db.QueryRow("SELECT COUNT(*) FROM reactions WHERE comment_id = $1 AND reaction_type = 'comment' AND reaction = -1;", comment_id)
	if err := row.Scan(&counts.Downvotes); err != nil {
		log.Printf("Error querying downvotes: %v", err)
		return nil, err
	}

	return &counts, nil
}

func (r *ReactionRepository) CreateReaction(reaction models.Reaction) (*models.Reaction, error) {
	var stmt *sql.Stmt
	var err error
	var existingReaction models.Reaction

	query := `
    SELECT id, reaction FROM reactions WHERE user_id = $1 AND 
    (post_id = $2 OR comment_id = $3)`

	err = r.db.QueryRow(query, reaction.UserID, reaction.PostID, reaction.CommentID).Scan(&existingReaction.ID, &existingReaction.ReactionValue)

	if err == sql.ErrNoRows {
		if reaction.ReactionType == "post" {
			stmt, err = r.db.Prepare("INSERT INTO reactions(user_id, post_id, comment_id, reaction_type, reaction, created_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING id")
		} else {
			stmt, err = r.db.Prepare("INSERT INTO reactions(user_id, post_id, comment_id, reaction_type, reaction, created_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING id")
		}

		if err != nil {
			log.Printf("Error preparing statement: %v", err)
			return nil, err
		}
		defer stmt.Close()

		if reaction.ReactionType == "post" {
			err = stmt.QueryRow(reaction.UserID, reaction.PostID, nil, reaction.ReactionType, reaction.ReactionValue, reaction.CreatedAt).Scan(&reaction.ID)
		} else {
			err = stmt.QueryRow(reaction.UserID, nil, reaction.CommentID, reaction.ReactionType, reaction.ReactionValue, reaction.CreatedAt).Scan(&reaction.ID)
		}

		if err != nil {
			log.Printf("Error executing statement: %v", err)
			return nil, err
		}
	} else if err == nil {
		if existingReaction.ReactionValue == reaction.ReactionValue {
			return nil, &DuplicateReactionError{
				UserID:    reaction.UserID,
				PostID:    reaction.PostID,
				CommentID: reaction.CommentID,
			}
		} else {
			stmt, err := r.db.Prepare("UPDATE reactions SET reaction = $1 WHERE id = $2")
			if err != nil {
				log.Printf("Error preparing update statement: %v", err)
				return nil, err
			}
			defer stmt.Close()

			_, err = stmt.Exec(reaction.ReactionValue, existingReaction.ID)
			if err != nil {
				log.Printf("Error executing update statement: %v", err)
				return nil, err
			}

			reaction.ID = existingReaction.ID
		}
	} else {
		return nil, err
	}

	return &reaction, nil
}

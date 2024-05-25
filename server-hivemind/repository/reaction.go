package repository

import (
	"database/sql"
	"log"
	"server-hivemind/models"
)

type ReactionRepository struct {
	db *sql.DB
}

func NewReactionRepository(db *sql.DB) *ReactionRepository {
	return &ReactionRepository{db: db}
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

	return &reaction, nil
}

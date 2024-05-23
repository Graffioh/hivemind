package repository

import (
	"database/sql"
	"log"
	"server-hivemind/models"
)

type CommentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) GetComments(post_id int) ([]*models.Comment, error) {
	rows, err := r.db.Query("SELECT id, post_id, user_id, content, created_at, up_vote, down_vote FROM comments WHERE post_id = $1", post_id)
	if err != nil {
		log.Printf("Error querying comments: %v", err)
		return nil, err
	}
	defer rows.Close()

	var comments []*models.Comment
	for rows.Next() {
		var comment models.Comment
		err := rows.Scan(&comment.ID, &comment.PostID, &comment.UserID, &comment.Content, &comment.CreatedAt, &comment.UpVote, &comment.DownVote)
		if err != nil {
			log.Printf("Error scanning comment row: %v", err)
			continue
		}
		comments = append(comments, &comment)
	}

	return comments, nil
}

func (r *CommentRepository) CreateComment(comment models.Comment) (*models.Comment, error) {
	stmt, err := r.db.Prepare("INSERT INTO comments(post_id, user_id, content, created_at) VALUES($1, $2, $3, $4) RETURNING id")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(comment.PostID, comment.UserID, comment.Content, comment.CreatedAt).Scan(&comment.ID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return nil, err
	}

	comment.UpVote = 0
	comment.DownVote = 0

	return &comment, nil
}

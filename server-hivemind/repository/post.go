package repository

import (
	"database/sql"
	"log"
	"server-hivemind/models"
)

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) GetPosts() ([]*models.Post, error) {
	rows, err := r.db.Query("SELECT id, user_id, content, created_at, up_vote, down_vote FROM posts")
	if err != nil {
		log.Printf("Error querying posts: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
		if err != nil {
			log.Printf("Error scanning post row: %v", err)
			continue
		}
		posts = append(posts, &post)
	}

	return posts, nil
}

func (r *PostRepository) GetPostsWithPagination(page int) ([]*models.Post, error) {
	rows, err := r.db.Query("SELECT id, user_id, content, created_at, up_vote, down_vote FROM posts ORDER BY id LIMIT 5 OFFSET $1", page)
	if err != nil {
		log.Printf("Error querying posts: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
		if err != nil {
			log.Printf("Error scanning post row: %v", err)
			continue
		}
		posts = append(posts, &post)
	}

	return posts, nil
}

func (r *PostRepository) GetPost(id int) (*models.Post, error) {
	var post models.Post
	err := r.db.QueryRow("SELECT id, user_id, content, created_at, up_vote, down_vote FROM posts WHERE id = $1", id).
		Scan(&post.ID, &post.UserID, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
	if err != nil {
		log.Printf("Error querying post: %v", err)
		return nil, err
	}

	return &post, nil
}

func (r *PostRepository) CreatePost(post models.Post) (*models.Post, error) {
	stmt, err := r.db.Prepare("INSERT INTO posts(user_id, content, created_at) VALUES($1, $2, $3) RETURNING id")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(post.UserID, post.Content, post.CreatedAt).Scan(&post.ID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return nil, err
	}

	post.UpVote = 0
	post.DownVote = 0

	return &post, nil
}

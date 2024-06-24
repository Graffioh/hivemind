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
	rows, err := r.db.Query("SELECT id, user_id, content, title, created_at, up_vote, down_vote FROM posts")
	if err != nil {
		log.Printf("Error querying posts: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
		if err != nil {
			log.Printf("Error scanning post row: %v", err)
			continue
		}
		posts = append(posts, &post)
	}

	return posts, nil
}

func (r *PostRepository) GetPostsWithPagination(page int, sort string) ([]*models.Post, error) {
	var query string

	// thanks claude 3.5 sonnet
	if sort == "CONTROVERSIAL" {
		query = "SELECT p.id, p.user_id, p.title, p.content, p.created_at, SUM(CASE WHEN r.reaction = 1 THEN 1 ELSE 0 END) AS up_vote, SUM(CASE WHEN r.reaction = -1 THEN 1 ELSE 0 END) AS down_vote FROM posts p LEFT JOIN reactions r ON p.id = r.post_id GROUP BY p.id ORDER BY ABS(SUM(CASE WHEN r.reaction = 1 THEN 1 ELSE 0 END) - SUM(CASE WHEN r.reaction = -1 THEN 1 ELSE 0 END)) DESC LIMIT 10 OFFSET $1;"
	} else if sort == "UNPOPULAR" {
		query = "SELECT p.id, p.user_id, p.title, p.content, p.created_at, SUM(CASE WHEN r.reaction = 1 THEN 1 ELSE 0 END) AS up_vote, SUM(CASE WHEN r.reaction = -1 THEN 1 ELSE 0 END) AS down_vote FROM posts p LEFT JOIN reactions r ON p.id = r.post_id GROUP BY p.id ORDER BY SUM(CASE WHEN r.reaction = -1 THEN 1 ELSE 0 END) DESC LIMIT 10 OFFSET $1;"
	} else {
		query = "SELECT p.id, p.user_id, p.title, p.content, p.created_at, SUM(CASE WHEN r.reaction = 1 THEN 1 ELSE 0 END) AS up_vote, SUM(CASE WHEN r.reaction = -1 THEN 1 ELSE 0 END) AS down_vote FROM posts p LEFT JOIN reactions r ON p.id = r.post_id GROUP BY p.id ORDER BY SUM(CASE WHEN r.reaction = 1 THEN 1 ELSE 0 END) DESC LIMIT 10 OFFSET $1;"
	}

	rows, err := r.db.Query(query, page*5)
	if err != nil {
		log.Printf("Error querying posts: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []*models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
		if err != nil {
			log.Printf("Error scanning post row: %v", err)
			continue
		}
		posts = append(posts, &post)
	}

	return posts, nil
}

func (r *PostRepository) GetTotalPostsCount() (*int, error) {
	var id *int
	err := r.db.QueryRow("SELECT COUNT(*) FROM posts").Scan(&id)
	if err != nil {
		log.Printf("Error querying post: %v", err)
		return nil, err
	}

	return id, nil
}

func (r *PostRepository) GetPost(id int) (*models.Post, error) {
	var post models.Post
	err := r.db.QueryRow("SELECT id, user_id, title, content, created_at, up_vote, down_vote FROM posts WHERE id = $1", id).
		Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
	if err != nil {
		log.Printf("Error querying post: %v", err)
		return nil, err
	}

	return &post, nil
}

func (r *PostRepository) CreatePost(post models.Post) (*models.Post, error) {
	stmt, err := r.db.Prepare("INSERT INTO posts(user_id, title, content, created_at) VALUES($1, $2, $3, $4) RETURNING id")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(post.UserID, post.Title, post.Content, post.CreatedAt).Scan(&post.ID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return nil, err
	}

	post.UpVote = 0
	post.DownVote = 0

	return &post, nil
}

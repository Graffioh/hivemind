package models

import (
	"log"
	"server-hivemind/config"
)

type Post struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	UpVote    int    `json:"up_vote"`
	DownVote  int    `json:"down_vote"`
}

func GetPosts() ([]*Post, error) {
	db := config.GetDB()

	rows, err := db.Query("SELECT id, user_id, content, created_at, up_vote, down_vote FROM posts")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []*Post
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
		if err != nil {
			log.Printf("Error scanning user row: %v", err)
			continue
		}
		posts = append(posts, &post)
	}

	return posts, nil
}

func GetPost(id int) (*Post, error) {
	db := config.GetDB()

	var post Post
	err := db.QueryRow("SELECT id, user_id, content, created_at, up_vote, down_vote FROM posts WHERE id = $1", id).Scan(&post.ID, &post.UserID, &post.Content, &post.CreatedAt, &post.UpVote, &post.DownVote)
	if err != nil {
		log.Printf("Error querying user: %v", err)
		return nil, err
	}

	return &post, nil
}

func CreatePost(post Post) (*Post, error) {
	db := config.GetDB()

	stmt, err := db.Prepare("INSERT INTO posts(user_id, content, created_at) VALUES($1, $2, $3) RETURNING id")
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

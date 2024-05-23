package models

type Post struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	UpVote    int    `json:"up_vote"`
	DownVote  int    `json:"down_vote"`
}

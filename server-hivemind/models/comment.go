package models

type Comment struct {
	ID        int    `json:"id"`
	PostID    int    `json:"post_id"`
	UserID    int    `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	UpVote    int    `json:"up_vote"`
	DownVote  int    `json:"down_vote"`
}

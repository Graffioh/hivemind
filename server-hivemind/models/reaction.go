package models

type Reaction struct {
	ID            int    `json:"id"`
	UserID        int64  `json:"user_id"`
	PostID        int    `json:"post_id"`
	CommentID     int    `json:"comment_id"`
	ReactionType  string `json:"reaction_type"`
	ReactionValue int    `json:"reaction"`
	CreatedAt     string `json:"created_at"`
}

type ReactionCounts struct {
	Upvotes   int
	Downvotes int
}

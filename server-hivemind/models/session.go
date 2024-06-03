package models

type Session struct {
	Token     string `json:"token"`
	ExpiresAt int    `json:"expires_at"`
	UserID    int64  `json:"user_id"`
}

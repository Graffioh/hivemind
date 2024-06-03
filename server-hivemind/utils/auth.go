package utils

import (
	"crypto/rand"
	"encoding/base32"
	"errors"
	"server-hivemind/config"
	"server-hivemind/models"
	"time"
)

func GenerateSessionToken() string {
	bytes := make([]byte, 15)
	rand.Read(bytes)
	sessionId := base32.StdEncoding.EncodeToString(bytes)
	return sessionId
}

func ValidateSession(session_id string) (*models.Session, error) {
	db := config.GetDB()

	var session models.Session

	err := db.QueryRow("SELECT token, expires_at, user_id FROM sessions WHERE token = $1;", session_id).Scan(&session.Token, &session.ExpiresAt, &session.UserID)
	if err != nil {
		return nil, errors.New("invalid session id")
	}

	expirationDate := time.Now().AddDate(0, 0, session.ExpiresAt)
	if time.Now().After(expirationDate) {
		return nil, errors.New("expired session")
	}

	return &session, nil
}

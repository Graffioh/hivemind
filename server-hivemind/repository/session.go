package repository

import (
	"database/sql"
	"log"
	"server-hivemind/config"
	"server-hivemind/models"
)

type SessionRepository struct {
	db *sql.DB
}

func NewSessionRepository(db *sql.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (s *SessionRepository) GetSession(session_id string) (*models.Session, error) {
	db := config.GetDB()

	var session models.Session

	err := db.QueryRow("SELECT token, expires_at, user_id FROM session WHERE token = $1;", session_id).Scan(&session.Token, &session.ExpiresAt, &session.UserID)
	if err != nil {
		log.Printf("Error querying session: %v", err)
		return nil, err
	}

	return &session, nil
}

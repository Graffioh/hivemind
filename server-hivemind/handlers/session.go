package handlers

import (
	"server-hivemind/repository"
)

type Sessions struct {
	repo *repository.SessionRepository
}

func NewSessions(repo *repository.SessionRepository) *Sessions {
	return &Sessions{repo: repo}
}

// func (s *Sessions) GetSession(rw http.ResponseWriter, r *http.Request) {
// 	cookie, err := r.Cookie("session_id")
// 	if err != nil {
// 		http.Error(rw, "Session not found in cookies", http.StatusBadRequest)
// 		return
// 	}

// 	sid := cookie.Value

// 	session, err := s.repo.GetSession(sid)

// 	if err != nil {
// 		http.Error(rw, "No session found", http.StatusBadRequest)
// 		return
// 	}

// 	rw.Header().Set("Content-Type", "application/json")
// 	utils.ToJSON(rw, session)
// }

package handlers

import (
	"encoding/json"
	"net/http"
	"server-hivemind/models"
	"server-hivemind/repository"
	"server-hivemind/utils"
	"time"
)

type Users struct {
	repo *repository.UserRepository
}

func NewUsers(repo *repository.UserRepository) *Users {
	return &Users{repo: repo}
}

func (u *Users) GetUser(rw http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(rw, "Session not found in cookies", http.StatusBadRequest)
		return
	}

	sid := cookie.Value

	s, err := utils.ValidateSession(sid)

	if err != nil {
		http.Error(rw, "Session not valid", http.StatusBadRequest)
		return
	}

	user, err := u.repo.GetUser(s.UserID)

	if err != nil {
		http.Error(rw, "No user found", http.StatusBadRequest)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, user)
}

func (u *Users) CreateUser(rw http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(rw, "Invalid input", http.StatusBadRequest)
		return
	}

	if user.Username == "" || user.Password == "" {
		http.Error(rw, "Username and Password are required", http.StatusBadRequest)
		return
	}

	user.ID = time.Now().Unix()

	createdUser, token, token_exp, err := u.repo.CreateUser(user)
	if err != nil {
		http.Error(rw, "Error creating user", http.StatusInternalServerError)
		return
	}

	cookie := &http.Cookie{
		Name:     "session_id",
		Value:    token,
		HttpOnly: true,
		Secure:   false, // Set to true if using HTTPS
		MaxAge:   token_exp * 24 * 60 * 60,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	}
	http.SetCookie(rw, cookie)

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdUser)
}

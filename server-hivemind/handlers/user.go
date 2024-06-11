package handlers

import (
	"encoding/json"
	"net/http"
	"server-hivemind/models"
	"server-hivemind/repository"
	"server-hivemind/utils"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type Users struct {
	repo *repository.UserRepository
}

func NewUsers(repo *repository.UserRepository) *Users {
	return &Users{repo: repo}
}

func (u *Users) GetCurrentUser(rw http.ResponseWriter, r *http.Request) {
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

	user, err := u.repo.GetUserById(s.UserID)

	if err != nil {
		http.Error(rw, "No user found", http.StatusBadRequest)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, user)
}

func (u *Users) GetUserById(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user_id_str, ok := vars["id"]
	if !ok {
		http.Error(rw, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user_id, err := strconv.ParseInt(user_id_str, 10, 64)
	if err != nil {
		http.Error(rw, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	user, err := u.repo.GetUserById(user_id)

	if err != nil {
		http.Error(rw, "No user found", http.StatusBadRequest)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, user)
}

func (u *Users) CreateOrLoginUser(rw http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(rw, "Invalid input", http.StatusBadRequest)
		return
	}

	existing_user, err := u.repo.GetUserByUsernameAndPassword(user.Username, user.Password)
	if err != nil {
		// REGISTRATION
		//
		// http.Error(rw, "No user found", http.StatusBadRequest)
		if user.Username == "" || user.Password == "" {
			http.Error(rw, "Username and Password are required", http.StatusBadRequest)
			return
		}

		user.ID = time.Now().Unix()

		createdUser, token, token_exp, err := u.repo.CreateUser(user)
		if err != nil {
			if err.Error() == "username already in use" {
				http.Error(rw, "Username already in use", http.StatusConflict)
			} else {
				http.Error(rw, "Error creating user", http.StatusInternalServerError)
			}
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
		utils.ToJSON(rw, createdUser)
		return
	}

	// LOGIN
	//
	token, token_exp, err := u.repo.CreateLoginSession(existing_user.ID)
	if err != nil {
		http.Error(rw, "Login failed", http.StatusBadRequest)
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
	utils.ToJSON(rw, existing_user)
}

func (u *Users) DeleteSession(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user_id_str, ok := vars["id"]
	if !ok {
		http.Error(rw, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user_id, err := strconv.ParseInt(user_id_str, 10, 64)
	if err != nil {
		http.Error(rw, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	u.repo.DeleteSession(user_id)

	name := "session_id"

	exp_cookie := http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(rw, &exp_cookie)

	rw.Write([]byte("Session cookie deleted"))
}

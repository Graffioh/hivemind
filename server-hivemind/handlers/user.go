package handlers

import (
	"encoding/json"
	"net/http"
	"server-hivemind/models"
	"server-hivemind/repository"
	"server-hivemind/utils"
	"strconv"

	"github.com/gorilla/mux"
)

type Users struct {
	repo *repository.UserRepository
}

func NewUsers(repo *repository.UserRepository) *Users {
	return &Users{repo: repo}
}

func (u *Users) GetUser(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(rw, "Failed to convert the id into integer", http.StatusBadRequest)
		return
	}

	user, err := u.repo.GetUser(id)

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

	createdUser, err := u.repo.CreateUser(user)
	if err != nil {
		http.Error(rw, "Error creating user", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdUser)
}

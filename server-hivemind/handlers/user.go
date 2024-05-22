package handlers

import (
	"net/http"
	"server-hivemind/models"
	"server-hivemind/utils"
	"strconv"

	"github.com/gorilla/mux"
)

type Users struct{}

func NewUsers() *Users {
	return &Users{}
}

func (u Users) GetUsers(rw http.ResponseWriter, r *http.Request) {
	users := models.GetUsers()

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, users)
}

func (u Users) GetUser(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(rw, "Failed to convert the id into integer", http.StatusBadRequest)
		return
	}

	user := models.GetUser(id)

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, user)
}

func (u Users) CreateUser(rw http.ResponseWriter, r *http.Request) {
}

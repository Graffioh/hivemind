package handlers

import (
	"encoding/json"
	"net/http"
	"server-hivemind/models"
	"server-hivemind/utils"
	"strconv"

	"github.com/gorilla/mux"
)

type Posts struct{}

func NewPosts() *Posts {
	return &Posts{}
}

func (p Posts) GetPosts(rw http.ResponseWriter, r *http.Request) {
	posts, err := models.GetPosts()

	if err != nil {
		http.Error(rw, "Error getting posts", http.StatusBadRequest)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, posts)
}

func (p Posts) GetPost(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(rw, "Failed to convert the id into integer", http.StatusBadRequest)
		return
	}

	post, err := models.GetPost(id)

	if err != nil {
		http.Error(rw, "No post found", http.StatusBadRequest)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, post)
}

func (p Posts) CreatePost(rw http.ResponseWriter, r *http.Request) {
	// Get post from request body
	var post models.Post

	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		http.Error(rw, "Error decoding request body", http.StatusBadRequest)
		return
	}

	if post.UserID == 0 || post.Content == "" {
		http.Error(rw, "Invalid input", http.StatusBadRequest)
		return
	}

	// Post creation
	createdPost, err := models.CreatePost(post)
	if err != nil {
		http.Error(rw, "Error creating post", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdPost)
}

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

type Comments struct {
	repo *repository.CommentRepository
}

func NewCommentHandler(repo *repository.CommentRepository) *Comments {
	return &Comments{repo: repo}
}

func (c *Comments) GetComments(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	post_id, err := strconv.Atoi(vars["post_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	comments, err := c.repo.GetComments(post_id)
	if err != nil {
		http.Error(rw, "Comments not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, comments)
}

func (c *Comments) CreateComment(rw http.ResponseWriter, r *http.Request) {
	var comment models.Comment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		http.Error(rw, "Invalid input", http.StatusBadRequest)
		return
	}

	if comment.PostID == 0 || comment.UserID == 0 || comment.Content == "" {
		http.Error(rw, "Comment inputs not valid!", http.StatusBadRequest)
		return
	}

	createdComment, err := c.repo.CreateComment(comment)
	if err != nil {
		http.Error(rw, "Error creating comment", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdComment)
}

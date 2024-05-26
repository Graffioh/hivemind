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

type Reactions struct {
	repo *repository.ReactionRepository
}

func NewReactions(repo *repository.ReactionRepository) *Reactions {
	return &Reactions{repo: repo}
}

func (reacs *Reactions) GetPostReactions(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	post_id, err := strconv.Atoi(vars["post_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	postVotes, err := reacs.repo.GetPostReactions(post_id)
	if err != nil {
		http.Error(rw, "Post votes not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, postVotes)
}

func (reacs *Reactions) GetCommentReactions(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	comment_id, err := strconv.Atoi(vars["comment_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	commentVotes, err := reacs.repo.GetCommentReactions(comment_id)
	if err != nil {
		http.Error(rw, "Comment votes not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, commentVotes)
}

func (reacs *Reactions) CreateReaction(rw http.ResponseWriter, r *http.Request) {
	var reaction models.Reaction
	if err := json.NewDecoder(r.Body).Decode(&reaction); err != nil {
		http.Error(rw, "Invalid input", http.StatusBadRequest)
		return
	}

	if reaction.UserID == 0 || reaction.ReactionType == "" || (reaction.ReactionValue != 1 && reaction.ReactionValue != -1) {
		http.Error(rw, "User ID, Reaction Type and Reaction Value are required", http.StatusBadRequest)
		return
	}

	createdReaction, err := reacs.repo.CreateReaction(reaction)
	if err != nil {
		http.Error(rw, "Error creating reaction", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdReaction)
}

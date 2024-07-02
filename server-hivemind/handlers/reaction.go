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

func NewReactionHandler(repo *repository.ReactionRepository) *Reactions {
	return &Reactions{repo: repo}
}

func (reacs *Reactions) GetPostReactionsCount(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	post_id, err := strconv.Atoi(vars["post_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	post_votes, err := reacs.repo.GetPostReactionsCount(post_id)
	if err != nil {
		http.Error(rw, "Post votes not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, post_votes)
}

func (reacs *Reactions) GetCommentReactionsCount(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	comment_id, err := strconv.Atoi(vars["comment_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	comment_votes, err := reacs.repo.GetCommentReactionsCount(comment_id)
	if err != nil {
		http.Error(rw, "Comment votes not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, comment_votes)
}

func (reacs *Reactions) GetUserReactionToPost(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	post_id, err := strconv.Atoi(vars["post_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	user_id_str := r.URL.Query().Get("user_id")
	user_id, err := strconv.Atoi(user_id_str)
	if err != nil {
		http.Error(rw, "Invalid user_id conversion", http.StatusBadRequest)
		return
	}

	post_reactions, err := reacs.repo.GetUserReactionToPost(post_id, user_id)
	if err != nil {
		http.Error(rw, "Post votes not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, post_reactions)
}

func (reacs *Reactions) GetUserReactionToComment(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	comment_id, err := strconv.Atoi(vars["comment_id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	user_id_str := r.URL.Query().Get("user_id")
	user_id, err := strconv.Atoi(user_id_str)
	if err != nil {
		http.Error(rw, "Invalid user_id conversion", http.StatusBadRequest)
		return
	}

	comment_reactions, err := reacs.repo.GetUserReactionToComment(comment_id, user_id)
	if err != nil {
		http.Error(rw, "Comment votes not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, comment_reactions)
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
		// // Sending different errors (duplicated or not)

		// if duplicateErr, ok := err.(*repository.DuplicateReactionError); ok {
		// 	http.Error(rw, duplicateErr.Error(), http.StatusConflict)
		// 	return
		// }

		http.Error(rw, "Error creating reaction", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdReaction)
}

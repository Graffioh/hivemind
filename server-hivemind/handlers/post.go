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

type Posts struct {
	repo *repository.PostRepository
}

func NewPosts(repo *repository.PostRepository) *Posts {
	return &Posts{repo: repo}
}

func (p *Posts) GetPosts(rw http.ResponseWriter, r *http.Request) {
	posts, err := p.repo.GetPosts()
	if err != nil {
		http.Error(rw, "Error getting posts", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, posts)
}

func (p *Posts) GetPostsWithPagination(rw http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		http.Error(rw, "Invalid page number", http.StatusBadRequest)
		return
	}

	posts, err := p.repo.GetPostsWithPagination(page)
	if err != nil {
		http.Error(rw, "Error getting posts", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, posts)
}

func (p *Posts) GetTotalPostsCount(rw http.ResponseWriter, r *http.Request) {
	count, err := p.repo.GetTotalPostsCount()
	if err != nil {
		http.Error(rw, "Error getting posts count, posts not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, count)
}

func (p *Posts) GetPost(rw http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(rw, "Invalid post ID", http.StatusBadRequest)
		return
	}

	post, err := p.repo.GetPost(id)
	if err != nil {
		http.Error(rw, "Post not found", http.StatusNotFound)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	utils.ToJSON(rw, post)
}

func (p *Posts) CreatePost(rw http.ResponseWriter, r *http.Request) {
	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(rw, "Invalid input", http.StatusBadRequest)
		return
	}

	if post.UserID == 0 || post.Title == "" || post.Content == "" {
		http.Error(rw, "User ID and content are required", http.StatusBadRequest)
		return
	}

	createdPost, err := p.repo.CreatePost(post)
	if err != nil {
		http.Error(rw, "Error creating post", http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	utils.ToJSON(rw, createdPost)
}

// func (p *Posts) UpdateUpVote(rw http.ResponseWriter, r *http.Request) {

// }

// func (p *Posts) UpdateDownVote(rw http.ResponseWriter, r *http.Request) {

// }

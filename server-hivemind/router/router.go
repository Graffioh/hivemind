// router/router.go

package router

import (
	"database/sql"
	"net/http"

	"server-hivemind/handlers"
	"server-hivemind/repository"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func NewRouter(db *sql.DB) http.Handler {

	router := mux.NewRouter()

	ur := repository.NewUserRepository(db)
	uh := handlers.NewUsers(ur)
	pr := repository.NewPostRepository(db)
	ph := handlers.NewPosts(pr)
	cr := repository.NewCommentRepository(db)
	ch := handlers.NewComments(cr)
	rr := repository.NewReactionRepository(db)
	rh := handlers.NewReactions(rr)

	router.HandleFunc("/user/current", uh.GetCurrentUser).Methods("GET")
	router.HandleFunc("/user/{id:[0-9]+}", uh.GetUserById).Methods("GET")
	router.HandleFunc("/user", uh.CreateOrLoginUser).Methods("POST")
	router.HandleFunc("/user/logout/{id:[0-9]+}", uh.DeleteSession).Methods("GET")

	router.HandleFunc("/post", ph.GetPosts).Methods("GET")
	router.HandleFunc("/post/pagination", ph.GetPostsWithPagination).Methods("GET")
	router.HandleFunc("/post/count", ph.GetTotalPostsCount).Methods("GET")
	router.HandleFunc("/post/{id:[0-9]+}", ph.GetPost).Methods("GET")
	router.HandleFunc("/post", ph.CreatePost).Methods("POST")

	router.HandleFunc("/comment/{post_id:[0-9]+}", ch.GetComments).Methods("GET")
	router.HandleFunc("/comment/{post_id:[0-9]+}", ch.CreateComment).Methods("POST")

	router.HandleFunc("/reaction/post/{post_id:[0-9]+}", rh.GetUserReactionToPost).Methods("GET")
	router.HandleFunc("/reaction/comment/{comment_id:[0-9]+}", rh.GetUserReactionToComment).Methods("GET")
	router.HandleFunc("/reaction/post/count/{post_id:[0-9]+}", rh.GetPostReactionsCount).Methods("GET")
	router.HandleFunc("/reaction/comment/count/{comment_id:[0-9]+}", rh.GetCommentReactionsCount).Methods("GET")
	router.HandleFunc("/reaction", rh.CreateReaction).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodOptions, http.MethodPut, http.MethodDelete},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	return c.Handler(router)
}

package main

import (
	"log"
	"net/http"
	"server-hivemind/config"
	"server-hivemind/handlers"
	"server-hivemind/repository"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("Error running the app: %v", err)
	}
}

func run() error {
	config.LoadEnv()

	// DB CONFIGURATION
	dbConnectionString := config.GetDBConnectionString()
	config.InitDB(dbConnectionString)

	db := config.GetDB()

	// Router init
	router := mux.NewRouter()

	// AllowedOrigins: * only for dev env
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodOptions, http.MethodPut, http.MethodDelete},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// HANDLERS
	//
	// Users
	ur := repository.NewUserRepository(db)
	uh := handlers.NewUsers(ur)
	//
	// Posts
	pr := repository.NewPostRepository(db)
	ph := handlers.NewPosts(pr)
	//
	// Comments
	cr := repository.NewCommentRepository(db)
	ch := handlers.NewComments(cr)
	//
	// Reactions
	rr := repository.NewReactionRepository(db)
	rh := handlers.NewReactions(rr)

	// ROUTES
	//
	// Users
	router.HandleFunc("/user/current", uh.GetCurrentUser).Methods("GET")
	router.HandleFunc("/user/{id:[0-9]+}", uh.GetUserById).Methods("GET")
	router.HandleFunc("/user", uh.CreateOrLoginUser).Methods("POST")
	router.HandleFunc("/user/logout/{id:[0-9]+}", uh.DeleteSession).Methods("GET")
	//
	// Posts
	router.HandleFunc("/post", ph.GetPosts).Methods("GET")
	router.HandleFunc("/post/pagination", ph.GetPostsWithPagination).Methods("GET")
	router.HandleFunc("/post/count", ph.GetTotalPostsCount).Methods("GET")
	router.HandleFunc("/post/{id:[0-9]+}", ph.GetPost).Methods("GET")
	router.HandleFunc("/post", ph.CreatePost).Methods("POST")
	//
	// Comments
	router.HandleFunc("/comment/{post_id:[0-9]+}", ch.GetComments).Methods("GET")
	router.HandleFunc("/comment/{post_id:[0-9]+}", ch.CreateComment).Methods("POST")
	//
	// Reactions
	router.HandleFunc("/reaction/post/{post_id:[0-9]+}", rh.GetPostReactions).Methods("GET")
	router.HandleFunc("/reaction/comment/{comment_id:[0-9]+}", rh.GetCommentReactions).Methods("GET")
	router.HandleFunc("/reaction", rh.CreateReaction).Methods("POST")

	server_handler := c.Handler(router)

	log.Println("Starting server on :8080")

	// Init server
	s := http.Server{
		Addr:         ":8080",
		Handler:      server_handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Serve server
	err := s.ListenAndServe()
	if err != nil {
		log.Fatalf("Could not start server: %s\n", err)
		return err
	}

	return nil
}

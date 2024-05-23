package main

import (
	"log"
	"net/http"
	"server-hivemind/config"
	"server-hivemind/handlers"
	"server-hivemind/repository"
	"server-hivemind/utils"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	config.LoadEnv()

	// DB CONFIGURATION
	dbConnectionString := config.GetDBConnectionString()
	config.InitDB(dbConnectionString)

	db := config.GetDB()

	// Router init
	router := mux.NewRouter()

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

	// ROUTES
	//
	// Users
	router.HandleFunc("/user", uh.GetUsers).Methods("GET")
	router.HandleFunc("/user/{id:[0-9]+}", uh.GetUser).Methods("GET")
	router.HandleFunc("/user", uh.CreateUser).Methods("POST")
	//
	// Posts
	router.HandleFunc("/post", ph.GetPosts).Methods("GET")
	router.HandleFunc("/post/{id:[0-9]+}", ph.GetPost).Methods("GET")
	router.HandleFunc("/post", ph.CreatePost).Methods("POST")
	// router.HandleFunc("/post/up/{id:[0-9]+}", ph.UpdateUpVote).Methods("PUT")
	// router.HandleFunc("/post/down/{id:[0-9]+}", ph.UpdateDownVote).Methods("PUT")
	//
	// Comments
	router.HandleFunc("/comment/{post_id:[0-9]+}", ch.GetComments).Methods("GET")
	router.HandleFunc("/comment/{post_id:[0-9]+}", ch.CreateComment).Methods("POST")

	// MIDDLEWARES
	//
	// CORS
	router.Use(utils.CORS)

	log.Println("Starting server on :8080")

	// Init server
	s := http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Serve server
	err := s.ListenAndServe()
	if err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}

}

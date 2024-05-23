package main

import (
	"log"
	"net/http"
	"server-hivemind/config"
	"server-hivemind/handlers"
	"server-hivemind/utils"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	config.LoadEnv()

	// DB CONFIGURATION
	dbConnectionString := config.GetDBConnectionString()
	config.InitDB(dbConnectionString)

	// Router init
	router := mux.NewRouter()

	// HANDLERS
	//
	// Users
	uh := handlers.NewUsers()
	//
	// Posts
	ph := handlers.NewPosts()

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

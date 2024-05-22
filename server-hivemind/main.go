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
	// DB CONFIGURATION
	config.LoadEnv()
	dbConnectionString := config.GetDBConnectionString()
	config.InitDB(dbConnectionString)

	// Router init
	router := mux.NewRouter()

	// HANDLERS
	//
	// Users
	uh := handlers.NewUsers()

	// ROUTES
	//
	// Users
	router.HandleFunc("/user", uh.GetUsers).Methods("GET")
	router.HandleFunc("/user/{id:[0-9]+}", uh.GetUser).Methods("GET")
	router.HandleFunc("/user", uh.CreateUser).Methods("POST")

	// MIDDLEWARES
	//
	// CORS
	router.Use(utils.CORS)

	log.Println("Starting server on :8080")

	// Server init
	s := http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Server run
	err := s.ListenAndServe()
	if err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}

}

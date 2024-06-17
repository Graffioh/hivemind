package main

import (
	"log"
	"net/http"
	"server-hivemind/config"
	"server-hivemind/router"
	"time"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("Error running the app: %v", err)
	}
}

func run() error {
	config.LoadEnv()

	// DB setup
	dbConnectionString := config.GetDBConnectionString()
	config.InitDB(dbConnectionString)
	db := config.GetDB()

	server_handler := router.NewRouter(db)

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

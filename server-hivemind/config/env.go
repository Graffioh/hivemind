package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func GetDBConnectionString() string {
	// Turso connection string format: libsql://<database-name>.<org-name>.turso.io?authToken=<token>
	// For local file: file:///path/to/database.db or file:./database.db
	connStr := os.Getenv("TURSO_DATABASE_URL")
	if connStr == "" {
		log.Fatalf("TURSO_DATABASE_URL environment variable is not set. Please set it to a valid libSQL connection string.")
	}
	return connStr
}

package config

import (
	"database/sql"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
	_ "modernc.org/sqlite" // Required for local SQLite file connections
)

var db *sql.DB

func InitDB(dataSourceName string) {
	if dataSourceName == "" {
		log.Fatalf("Database connection string is empty. Please set TURSO_DATABASE_URL environment variable.")
	}

	var err error
	db, err = sql.Open("libsql", dataSourceName)
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Could not ping the database: %v\nMake sure your TURSO_DATABASE_URL starts with one of: libsql://, file://, https://, http://, wss://, ws://", err)
	}

	// Initialize schema
	if err := initSchema(); err != nil {
		log.Fatalf("Could not initialize database schema: %v", err)
	}
}

func initSchema() error {
	// Try multiple paths to find schema.sql
	var schemaSQL []byte
	var err error

	// Try current directory
	schemaSQL, err = os.ReadFile("schema.sql")
	if err != nil {
		// Try server-hivemind directory
		schemaSQL, err = os.ReadFile("server-hivemind/schema.sql")
		if err != nil {
			// Try relative to executable
			execPath, _ := os.Executable()
			schemaPath := filepath.Join(filepath.Dir(execPath), "schema.sql")
			schemaSQL, err = os.ReadFile(schemaPath)
			if err != nil {
				// Try working directory
				wd, _ := os.Getwd()
				schemaPath = filepath.Join(wd, "schema.sql")
				schemaSQL, err = ioutil.ReadFile(schemaPath)
				if err != nil {
					log.Printf("Warning: Could not read schema.sql, tables may not exist: %v", err)
					return nil // Don't fail if schema file doesn't exist
				}
			}
		}
	}

	// Execute schema
	_, err = db.Exec(string(schemaSQL))
	if err != nil {
		return err
	}

	log.Println("Database schema initialized successfully")
	return nil
}

func GetDB() *sql.DB {
	return db
}

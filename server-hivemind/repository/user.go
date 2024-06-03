package repository

import (
	"database/sql"
	"log"
	"server-hivemind/config"
	"server-hivemind/models"
	"server-hivemind/utils"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (u *UserRepository) GetUsers() ([]*models.User, error) {
	db := config.GetDB()

	rows, err := db.Query("SELECT id, username, password FROM users")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Username, &user.Password)
		if err != nil {
			log.Printf("Error scanning user row: %v", err)
			continue
		}
		users = append(users, &user)
	}

	return users, nil
}

func (u *UserRepository) GetUser(user_id int64) (*models.User, error) {
	db := config.GetDB()

	var user models.User

	err := db.QueryRow("SELECT id, username, password FROM users WHERE id = $1", user_id).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		log.Printf("Error querying user: %v", err)
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) CreateUser(user models.User) (*models.User, string, int, error) {
	db := config.GetDB()

	tx, err := db.Begin()
	if err != nil {
		log.Printf("Error beginning transaction: %v", err)
		return nil, "", 0, err
	}
	defer tx.Rollback()

	// Hash the user's password before storing it
	// hashedPassword, err := HashPassword(user.Password)
	// if err != nil {
	//     log.Printf("Error hashing password: %v", err)
	//     return nil, err
	// }

	stmt, err := tx.Prepare("INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING id")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, "", 0, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(user.ID, user.Username, user.Password).Scan(&user.ID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return nil, "", 0, err
	}

	session := &models.Session{
		Token:     utils.GenerateSessionToken(),
		ExpiresAt: 30,
		UserID:    user.ID,
	}

	stmt, err = tx.Prepare("INSERT INTO sessions(token, expires_at, user_id) VALUES($1, $2, $3)")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, "", 0, err
	}

	_, err = stmt.Exec(session.Token, session.ExpiresAt, session.UserID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return nil, "", 0, err
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		return nil, "", 0, err
	}

	return &user, session.Token, session.ExpiresAt, nil
}

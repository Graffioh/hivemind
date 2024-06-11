package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"server-hivemind/models"
	"server-hivemind/utils"

	"github.com/lib/pq"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (u *UserRepository) GetUsers() ([]*models.User, error) {
	rows, err := u.db.Query("SELECT id, username, password FROM users")
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

func (u *UserRepository) GetUserById(user_id int64) (*models.User, error) {
	var user models.User

	err := u.db.QueryRow("SELECT id, username, password FROM users WHERE id = $1", user_id).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		log.Printf("Error querying user by id: %v", err)
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) GetUserByUsernameAndPassword(username string, password string) (*models.User, error) {
	var user models.User

	err := u.db.QueryRow("SELECT id, username, password FROM users WHERE username = $1", username).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		log.Printf("Error querying, user does not exist: %v", err)
		return nil, err
	}

	check, err := utils.CheckPasswords(password, user.Password)
	if err != nil {
		return nil, err
	}

	if !check {
		return nil, fmt.Errorf("password hash comparison failed: %v", err)
	}

	return &user, nil
}

func (u *UserRepository) GetUserByPost(user_id int64) (*models.User, error) {
	var user models.User

	err := u.db.QueryRow("SELECT id, username, password FROM users WHERE id = $1", user_id).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		log.Printf("Error querying user by post user_id: %v", err)
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) CreateUser(user models.User) (*models.User, string, int, error) {
	tx, err := u.db.Begin()
	if err != nil {
		log.Printf("Error beginning transaction: %v", err)
		return nil, "", 0, err
	}
	defer tx.Rollback()

	encoded_hash_pw, err := utils.HashPassword(user.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return nil, "", 0, err
	}

	stmt, err := tx.Prepare("INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING id")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, "", 0, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(user.ID, user.Username, encoded_hash_pw).Scan(&user.ID)
	if err != nil {
		if pg_err, ok := err.(*pq.Error); ok {
			if pg_err.Code == "23505" {
				return nil, "", 0, errors.New("username already in use")
			}
		}
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

func (u *UserRepository) CreateLoginSession(user_id int64) (string, int, error) {
	session := &models.Session{
		Token:     utils.GenerateSessionToken(),
		ExpiresAt: 30,
		UserID:    user_id,
	}

	stmt, err := u.db.Prepare("INSERT INTO sessions(token, expires_at, user_id) VALUES($1, $2, $3)")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return "", 0, err
	}

	_, err = stmt.Exec(session.Token, session.ExpiresAt, session.UserID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return "", 0, err
	}

	return session.Token, session.ExpiresAt, nil
}

func (u *UserRepository) DeleteSession(user_id int64) (int64, error) {
	stmt, err := u.db.Prepare("DELETE FROM sessions WHERE user_id = $1")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return 0, err
	}

	_, err = stmt.Exec(user_id)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return 0, err
	}

	return user_id, nil
}

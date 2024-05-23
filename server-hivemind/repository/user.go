package repository

import (
	"database/sql"
	"log"
	"server-hivemind/config"
	"server-hivemind/models"
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

func (u *UserRepository) GetUser(id int) (*models.User, error) {
	db := config.GetDB()

	var user models.User
	err := db.QueryRow("SELECT id, username, password FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		log.Printf("Error querying user: %v", err)
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) CreateUser(user models.User) (*models.User, error) {
	db := config.GetDB()

	// Hash the user's password before storing it
	// hashedPassword, err := HashPassword(user.Password)
	// if err != nil {
	//     log.Printf("Error hashing password: %v", err)
	//     return nil, err
	// }

	stmt, err := db.Prepare("INSERT INTO users(username, password) VALUES($1, $2) RETURNING id")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		return nil, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(user.Username, user.Password).Scan(&user.ID)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		return nil, err
	}

	return &user, nil
}

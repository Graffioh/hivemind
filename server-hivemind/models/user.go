package models

import (
	"log"
	"server-hivemind/config"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func GetUsers() ([]*User, error) {
	db := config.GetDB()

	rows, err := db.Query("SELECT id, username, password FROM users")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Username, &user.Password)
		if err != nil {
			log.Printf("Error scanning user row: %v", err)
			continue
		}
		users = append(users, &user)
	}

	return users, nil
}

func GetUser(id int) (*User, error) {
	db := config.GetDB()

	var user User
	err := db.QueryRow("SELECT id, username, password FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		log.Printf("Error querying user: %v", err)
		return nil, err
	}

	return &user, nil
}

func CreateUser(user User) (*User, error) {
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

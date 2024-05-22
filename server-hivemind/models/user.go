package models

import (
	"database/sql"
	"log"
	"server-hivemind/config"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func GetUsers() []*User {
	db := config.GetDB()

	rows, err := db.Query("SELECT id, username, password FROM users")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		return nil
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

	return users
}

func GetUser(id int) *User {
	db := config.GetDB()

	var user User
	err := db.QueryRow("SELECT id, username, password FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil
		}
		log.Printf("Error querying user: %v", err)
		return nil
	}

	return &user
}

// var users = []*User{
// 	{
// 		ID:       1,
// 		Username: "carletto",
// 		Password: "carl123",
// 	},
// 	{
// 		ID:       2,
// 		Username: "paky55",
// 		Password: "ppp",
// 	},
// 	{
// 		ID:       3,
// 		Username: "graffioh",
// 		Password: "gthebest",
// 	},
// }

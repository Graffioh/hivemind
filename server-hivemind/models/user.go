package models

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func GetUsers() []*User {
	return users
}

func GetUser(id int) *User {
	for _, user := range users {
		if user.ID == id {
			return user
		}
	}

	return nil
}

var users = []*User{
	{
		ID:       1,
		Username: "carletto",
		Password: "carl123",
	},
	{
		ID:       2,
		Username: "paky55",
		Password: "ppp",
	},
	{
		ID:       3,
		Username: "graffioh",
		Password: "gthebest",
	},
}

import { User } from "../types";

export async function createUser(newUser: User): Promise<User> {
    const response = await fetch("http://localhost:8080/user", {
        method: "POST",
        body: JSON.stringify(newUser),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error("Failed to create the user");
    }

    return response.json();
}

export async function fetchUserFromSession(): Promise<User> {
    const response = await fetch("http://localhost:8080/user/current", {
        method: "GET",
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error("Failed to get the user based on session_id");
    }

    return response.json();
}
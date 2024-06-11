import { User } from "../types";

export async function createUser(newUser: User): Promise<User> {
    const response = await fetch("http://localhost:8080/user", {
        method: "POST",
        body: JSON.stringify(newUser),
        credentials: 'include'
    });

    if (!response.ok) {
        if (response.statusText === "Conflict") {
            alert("Username already in use!")
        }

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

export async function fetchUserFromId(userId: number) {
    const response = await fetch("http://localhost:8080/user/" + userId);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function logout() {
    const response = await fetch("http://localhost:8080/user/logout", {
        method: 'GET',
        credentials: 'include' 
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.text();
}
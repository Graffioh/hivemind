import { Post } from "../types";

export async function fetchPostsPaginated({
    pageParam,
    sorting
}: {
    pageParam: number;
    sorting: string;
}): Promise<{
    data: Post[];
    currentPage: number;
    nextPage: number | null;
}> {
    const countResponse = await fetch("http://localhost:8080/post/count");
    if (!countResponse.ok) {
        throw new Error("Network response was not ok");
    }

    const postsCount = await countResponse.json();

    const response = await fetch(
        `http://localhost:8080/post/pagination?page=${pageParam}&sort=${sorting}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const posts = await response.json();

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: posts,
                currentPage: pageParam,
                nextPage: (pageParam + 1) * 10 < postsCount ? pageParam + 1 : null,
            });
        }, 500);
    });
}

export async function fetchPost(postId: string) {
    const response = await fetch(`http://localhost:8080/post/${postId}`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function createPost(newPost: Post): Promise<Post> {
    const response = await fetch("http://localhost:8080/post", {
        method: "POST",
        body: JSON.stringify(newPost),
    });

    if (!response.ok) {
        throw new Error("Failed to create post");
    }

    return response.json();
}
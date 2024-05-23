import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Post from "../components/post";

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export default function PostPage() {
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(
          "http://localhost:8080/post/" + searchParams.get("post_id")
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = (await response.json()) as Post;
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    }

    fetchPost();
  }, [searchParams]);

  useEffect(() => {
    async function fetchComments() {
      if (post) {
        try {
          const response = await fetch(
            "http://localhost:8080/comment/" + post.id
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = (await response.json()) as Comment[];
          setComments(data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      }
    }

    fetchComments();
  }, [post]);

  return (
    <>
      <div className="flex flex-col w-full">
        {post ? (
          <>
            <div>{post.content}</div>
            {comments ? (
              <div>
                {comments.map((comment) => (
                  <div key={comment.id}>{comment.content}</div>
                ))}
              </div>
            ) : (
              <div>No comments.</div>
            )}
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

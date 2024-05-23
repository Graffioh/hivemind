// src/components/PostPage.jsx
import { useQuery } from "@tanstack/react-query";
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

const fetchPost = async (postId: string) => {
  const response = await fetch("http://localhost:8080/post/" + postId);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const fetchComments = async (postId: string) => {
  const response = await fetch("http://localhost:8080/comment/" + postId);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export default function PostPage() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("post_id");

  const { data: post, error: postError } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId!),
    enabled: !!postId,
  });

  const { data: comments = [], error: commentsError } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId!),
    enabled: !!post,
  });

  if (postError || commentsError) {
    return <span>Error: {postError?.message || commentsError?.message}</span>;
  }

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

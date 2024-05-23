import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoginSection from "./LoginSection";
import Post from "../components/post";

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch("http://localhost:8080/post");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function createPost(newPost: Post): Promise<Post> {
  const response = await fetch("http://localhost:8080/post", {
    method: "POST",
    body: JSON.stringify(newPost),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}

export default function HomePage() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const { data: posts = [], error } = useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const mutation = useMutation<Post, Error, Post>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handlePost = () => {
    if (textAreaRef.current) {
      const content = textAreaRef.current.value;

      const newPost: Post = {
        id: Date.now(),
        user_id: 1,
        content: content,
        created_at: new Date(),
      };

      mutation.mutate(newPost);

      textAreaRef.current.value = "";
    }
  };

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <div className="text-3xl font-bold">Hivemind</div>
      <div className="flex flex-col w-full">
        <LoginSection />
        <div className="flex flex-col items-center">
          <textarea
            ref={textAreaRef}
            rows={10}
            cols={50}
            className="p-1"
          ></textarea>
          <button onClick={handlePost} className="m-4 w-24 h-12">
            post
          </button>
        </div>
        <div className="mt-4 rounded w-[75vw]">
          <p className="font-bold text-white text-2xl">Board</p>
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    </>
  );
}

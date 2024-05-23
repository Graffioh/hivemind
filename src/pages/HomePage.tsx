import { useRef, useState, useEffect } from "react";
import Post from "../components/post";
import LoginSection from "./LoginSection";

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export default function HomePage() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("http://localhost:8080/post");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = (await response.json()) as Post[];
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    fetchPosts();
  }, []);

  async function handlePost() {
    if (textAreaRef.current) {
      const content = textAreaRef.current.value;

      const post: Post = {
        id: Date.now(),
        user_id: 1,
        content: content,
        created_at: new Date(),
      };

      const postResponse = await fetch("http://localhost:8080/post", {
        method: "POST",
        body: JSON.stringify(post),
      });

      console.log(postResponse);

      textAreaRef.current.value = "";
    }
  }

  return (
    <>
      <div className="text-3xl font-bold">Hivemind</div>
      <div className="flex flex-col w-full">
        <LoginSection />
        {/* <div className="text-2xl m-8">Welcome mammt123!</div>
        <div className="text-2xl m-8">What are you thinking?</div> */}
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
          {posts.map((post) => {
            return <Post key={post.id} post={post} />;
          })}
        </div>
      </div>
    </>
  );
}

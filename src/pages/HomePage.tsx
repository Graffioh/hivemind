import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Post from "../components/post";
import LoginPage from "./LoginPage";

interface Post {
  id: number;
  content: string;
}

export default function HomePage() {
  //   const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
    },
  ]);

  function handlePost() {
    if (textAreaRef.current) {
      const content = textAreaRef.current.value;
      setPosts((prevPosts) => [
        ...prevPosts,
        { id: prevPosts.length + 1, content },
      ]);
      textAreaRef.current.value = "";
    }
  }

  return (
    <>
      <div className="flex flex-col w-full">
        {/* <div>Home Page</div> */}
        {/* <button
          onClick={() => {
            navigate("/");
          }}
          className="m-4 w-24 h-12"
        >
          Login
        </button> */}
        <LoginPage />
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
        <div className="mt-4 border-2 border-stone-600 rounded">
          <a className="font-bold text-white text-xl">Board</a>
          {posts.map((post) => {
            return <Post post={post} />;
          })}
        </div>
      </div>
    </>
  );
}

/// <reference types="vite-plugin-svgr/client" />

import { useRef, useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
  QueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Post, User } from "../types";
import { fetchPostsPaginated, createPost } from "../api/post";
import {
  fetchUserFromSession,
  fetchUserFromId,
  createUser,
  logout,
} from "../api/user";
import VoteArrows from "../components/VoteArrows";
import HivemindSVG from "../assets/hivemind-logo-hd.svg?react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery<User>({
    queryKey: ["current_user"],
    queryFn: () => fetchUserFromSession(),
  });

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className="mt-4">
          <HivemindSVG />
        </div>
        <div className="flex flex-col w-full">
          {currentUser ? (
            <>
              <div className="flex flex-col justify-center items-center mb-8">
                <div className="flex text-2xl mt-3 font-bold">
                  Welcome{" "}
                  <span className="text-stone-400 pl-2">
                    {currentUser.username}
                  </span>
                  , start posting and enter the hive!
                </div>
                <button
                  onClick={() => logout(currentUser.id)}
                  className="text-sm bg-transparent text-stone-500 hover:text-stone-400 hover:bg-transparent w-fit"
                >
                  log out
                </button>
              </div>
              <PostForm queryClient={queryClient} currentUser={currentUser} />
            </>
          ) : (
            <LoginForm queryClient={queryClient} />
          )}
          <ThoughtsBoard />
        </div>
      </div>
    </>
  );
}

function PostForm({
  queryClient,
  currentUser,
}: {
  queryClient: QueryClient;
  currentUser: User;
}) {
  const [isPostActive, setIsPostActive] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation<Post, Error, Post>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  function handleIsPostActive() {
    const title = titleInputRef.current?.value || "";
    const content = textAreaRef.current?.value || "";
    setIsPostActive(title !== "" && content !== "");
  }

  function handlePost() {
    if (textAreaRef.current && titleInputRef.current) {
      const title = titleInputRef.current.value;
      const content = textAreaRef.current.value;

      const titleRegex = /^.{3,100}$/;
      const contentRegex = /^.{10,1000}$/;

      if (!titleRegex.test(title)) {
        alert("Title must be 3-100 characters long.");
        return;
      }

      if (!contentRegex.test(content)) {
        alert("Content must be 10-1000 characters long.");
        return;
      }

      const newPost: Post = {
        id: Date.now(),
        user_id: currentUser.id,
        title: title,
        content: content,
        created_at: new Date(),
      };

      mutation.mutate(newPost);

      titleInputRef.current.value = "";
      textAreaRef.current.value = "";
      setIsPostActive(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <input
        ref={titleInputRef}
        className="w-64 p-1 rounded border-x-2 border-t-2 border-neutral-600"
        placeholder="Title"
        required
        onChange={handleIsPostActive}
      />
      <textarea
        ref={textAreaRef}
        rows={10}
        cols={50}
        className="p-1 rounded border-2 border-neutral-600"
        placeholder="Write your thoughts..."
        required
        onChange={handleIsPostActive}
      />
      <button
        onClick={handlePost}
        className="m-4 w-24 h-12 disabled:bg-stone-800 font-bold"
        disabled={!isPostActive}
      >
        Post
      </button>
    </div>
  );
}

function ThoughtsBoard() {
  const { data, error, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPostsPaginated,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="flex flex-col rounded items-center mt-4 mx-10">
      <p className="font-bold text-white text-2xl">Thoughts Board</p>
      {data ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.pages.map((page: any) => (
          <div key={page.currentPage} className="flex flex-col gap-2 w-full">
            {page.data.map((post: Post) => (
              <PostSection key={post.id} post={post} />
            ))}
          </div>
        ))
      ) : (
        <LoadingSpinner />
      )}
      <div ref={ref}>{isFetchingNextPage && "Loading..."}</div>
    </div>
  );
}

export function PostSection({ post }: { post: Post }) {
  const navigate = useNavigate();

  function goToPostPage() {
    navigate(`/post-page?post_id=${post.id}`);
  }

  const { data: userByPost } = useQuery<User>({
    queryKey: ["user_post", post.user_id],
    queryFn: () => fetchUserFromId(post.user_id),
  });

  return (
    <>
      <div className="flex flex-col text-left">
        <div className="border-b-2 border-stone-600 mx-4 py-3">
          <button
            id="button-post"
            className="w-full py-2 px-1"
            onClick={goToPostPage}
          >
            <div className="text-stone-400 flex">
              {" "}
              &lt; {userByPost?.username} &gt;
            </div>
            <div key={post.id} className="p-1 pb-4 pt-2 max-w-full text-left">
              {post.title}
            </div>
            <div className="flex">
              <VoteArrows vertical={false} postId={post.id} commentId={null} />
              <div className="mx-1">
                <button className="px-2">💬</button>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

export function LoginForm({ queryClient }: { queryClient: QueryClient }) {
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation<User, Error, User>({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  function handleLogin() {
    const username = usernameInputRef.current?.value ?? "";
    const password = passwordInputRef.current?.value ?? "";

    if (!username || !password) {
      console.error("Username or password is empty");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^\S{10,30}$/;

    // q allowed only for testing!!!!!!!!!!!!
    if (!usernameRegex.test(username) && username != "q") {
      alert(
        "Username must be 3-20 characters long and can only contain letters, numbers, and underscores"
      );
      return;
    }

    // q allowed only for testing!!!!!!!!!!!!
    if (!passwordRegex.test(password) && password != "q") {
      alert("Password must be 10-30 characters long and cannot contain spaces");
      return;
    }

    const newUser: User = {
      id: Date.now(),
      username: username,
      password: password,
    };

    mutation.mutate(newUser, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["current_user"] });
      },
    });
  }

  if (mutation.isPending || mutation.isSuccess) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex flex-col m-4 items-center justify-center">
        <input
          placeholder="username"
          className="m-2 px-2 py-1 rounded border-2 border-neutral-600"
          ref={usernameInputRef}
          required
        ></input>
        <input
          type="password"
          placeholder="password"
          className="m-2 px-2 py-1 rounded border-2 border-neutral-600"
          ref={passwordInputRef}
          required
          pattern="/^\S{10,30}$/m"
        ></input>
        <button onClick={handleLogin} className="mb-2 w-32 h-8">
          Login/Register
        </button>
        <div className="text-sm text-stone-400">
          or register by simply entering a new username and password
        </div>
      </div>
    </>
  );
}

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
import { fetchUserFromSession, createUser } from "../api/user";
import VoteArrows from "../components/VoteArrows";

export default function HomePage() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery<User>({
    queryKey: ["current_user"],
    queryFn: () => fetchUserFromSession(),
  });

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className="text-3xl font-bold mt-4">Hivemind</div>
        <div className="flex flex-col w-full">
          {currentUser ? (
           <PostForm queryClient={queryClient} />
          ) : (
            <LoginSection queryClient={queryClient} />
          )}
          <ThoughtsBoard />
        </div>
      </div>
    </>
  );
}

function PostForm({ queryClient }: { queryClient: QueryClient }) {
  const [isPostValid, setIsPostValid] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation<Post, Error, Post>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  function handleIsPostValid() {
    const title = titleInputRef.current?.value || "";
    const content = textAreaRef.current?.value || "";
    setIsPostValid(title !== "" && content !== "");
  }

  function handlePost() {
    if (textAreaRef.current && titleInputRef.current) {
      const title = titleInputRef.current.value;
      const content = textAreaRef.current.value;

      const newPost: Post = {
        id: Date.now(),
        user_id: 1,
        title: title,
        content: content,
        created_at: new Date(),
      };

      mutation.mutate(newPost);

      titleInputRef.current.value = "";
      textAreaRef.current.value = "";
      setIsPostValid(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <input
        ref={titleInputRef}
        className="w-64 p-1 rounded border-x-2 border-t-2 border-neutral-600"
        placeholder="Title"
        required
        onChange={handleIsPostValid}
      />
      <textarea
        ref={textAreaRef}
        rows={10}
        cols={50}
        className="p-1 rounded border-2 border-neutral-600"
        placeholder="Write your thoughts..."
        required
        onChange={handleIsPostValid}
      />
      <button
        onClick={handlePost}
        className="m-4 w-24 h-12 disabled:bg-stone-800 font-bold"
        disabled={!isPostValid}
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
    <div className="flex flex-col mx-20 rounded items-center mt-4">
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
        <div>...</div>
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

  return (
    <>
      <div className="flex flex-col text-left mx-4 w-full">
        <div className="border-b-2 border-stone-600 mx-4 py-3">
          <button
            id="button-post"
            className="w-full py-2 px-1"
            onClick={goToPostPage}
          >
            <div className="text-stone-400 flex"> &lt; username &gt;</div>
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

export function LoginSection({ queryClient }: { queryClient: QueryClient }) {
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

    const newUser: User = {
      id: Date.now(),
      username: username,
      password: password,
    };

    mutation.mutate(newUser);
  }

  return (
    <>
      <div className="flex flex-col m-4 items-center justify-center">
        <input
          placeholder="username"
          className="m-2 px-2 py-1 rounded border-2 border-neutral-600"
          ref={usernameInputRef}
        ></input>
        <input
          type="password"
          placeholder="password"
          className="m-2 px-2 py-1 rounded border-2 border-neutral-600"
          ref={passwordInputRef}
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

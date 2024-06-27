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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const {
    data: currentUser,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["current_user"],
    queryFn: () => fetchUserFromSession(),
  });

  function handleLogout(currentUserId: number) {
    logout(currentUserId, () => {
      queryClient.invalidateQueries({ queryKey: ["current_user"] });
      queryClient.removeQueries({ queryKey: ["current_user"] });
      setIsLoggedIn(false);
    });
  }

  useEffect(() => {
    if (!isLoading && !isError && currentUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [currentUser, isLoading, isError]);

  const [sorting, setSorting] = useState<Sorting>(Sorting.Controversial);

  function handleSorting(sorting: Sorting) {
    setSorting(sorting);
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className="mt-4">
          <HivemindSVG />
        </div>
        <div className="flex flex-col w-full">
          {isLoggedIn ? (
            <>
              <div className="flex flex-col justify-center items-center mb-6 text-center">
                <div className="text-xl md:text-2xl mt-3 font-bold text-wrap px-2">
                  {" "}
                  Welcome
                  <span className="pl-2 text-yellow-500">
                    {currentUser!.username}
                  </span>
                  , <br /> Start posting and enter the hive!
                </div>
                <button
                  onClick={() => handleLogout(currentUser!.id)}
                  className="text-sm bg-transparent text-stone-400 hover:text-neutral-500 hover:bg-transparent w-fit"
                >
                  log out
                </button>
              </div>
              <PostForm
                queryClient={queryClient}
                currentUser={currentUser!}
                sorting={sorting}
              />
            </>
          ) : (
            <LoginForm queryClient={queryClient} />
          )}
          <ThoughtsBoard sorting={sorting} handleSorting={handleSorting} />
        </div>
      </div>
    </>
  );
}

function PostForm({
  queryClient,
  currentUser,
  sorting,
}: {
  queryClient: QueryClient;
  currentUser: User;
  sorting: Sorting;
}) {
  const [isPostActive, setIsPostActive] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation<Post, Error, Post>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", sorting] });
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

      if (!titleRegex.test(title)) {
        alert("Title must be 3-100 characters long.");
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
        className="w-96 p-1 rounded border-2 border-neutral-600 mb-1"
        placeholder="Title"
        required
        onChange={handleIsPostActive}
      />
      <textarea
        ref={textAreaRef}
        rows={8}
        className="w-11/12 md:w-2/4 p-1 rounded border-2 border-neutral-600"
        placeholder="Write your thoughts..."
        required
        onChange={handleIsPostActive}
      />
      <span className="text-sm">
        (You can format the text using{" "}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-neutral-500"
        >
          markdown syntax
        </a>
        )
      </span>
      <button
        onClick={handlePost}
        className="m-4 mb-6 w-24 h-12 disabled:bg-stone-800 font-bold"
        disabled={!isPostActive}
      >
        Post
      </button>
    </div>
  );
}

enum Sorting {
  Mainstream = "MAINSTREAM",
  Controversial = "CONTROVERSIAL",
  Unpopular = "UNPOPULAR",
}

function ThoughtsBoard({
  sorting,
  handleSorting,
}: {
  sorting: Sorting;
  handleSorting: (sorting: Sorting) => void;
}) {
  const { data, error, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts", sorting],
    queryFn: ({ pageParam }) => fetchPostsPaginated({ pageParam, sorting }),
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
      <SegmentedControlFilter sorting={sorting} handleSorting={handleSorting} />
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

function PostSection({ post }: { post: Post }) {
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
          <div
            id="button-post"
            className="w-full py-2 px-1 hover:cursor-pointer"
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
          </div>
        </div>
      </div>
    </>
  );
}

function LoginForm({ queryClient }: { queryClient: QueryClient }) {
  const mutation = useMutation<User, Error, User>({
    mutationFn: createUser,
  });

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = {
      usernameData: (
        event.currentTarget.elements.namedItem("username") as HTMLInputElement
      ).value,
      passwordData: (
        event.currentTarget.elements.namedItem("password") as HTMLInputElement
      ).value,
    };

    const username = formData.usernameData;
    const password = formData.passwordData;

    if (!username || !password) {
      console.error("Username or password is empty");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^\S{10,30}$/;

    // q allowed only for testing!!!!!!!!!!!!
    if (!usernameRegex.test(username) && username != "q") {
      alert(
        "Username must be 3-20 characters long and can only contain letters, numbers, and underscores",
      );
      return;
    }

    // q allowed only for testing!!!!!!!!!!!!
    if (!passwordRegex.test(password) && password != "q") {
      alert("Password must be 10-30 characters long and cannot contain spaces");
      return;
    }

    const user: User = {
      id: Date.now(),
      username: username,
      password: password,
    };

    mutation.mutate(user, {
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
      <form onSubmit={handleLogin}>
        <div className="flex flex-col m-4 items-center justify-center">
          <input
            name="username"
            id="username"
            placeholder="username"
            className="m-2 px-2 py-1 rounded border-2 border-neutral-600"
            required
          ></input>
          <input
            name="password"
            id="password"
            type="password"
            placeholder="password"
            className="m-2 px-2 py-1 rounded border-2 border-neutral-600"
            required
          ></input>
          <button className="mb-2 w-32 h-8">Login/Register</button>
          <div className="text-sm text-stone-400">
            or register by simply entering a new username and password
          </div>
        </div>
      </form>
    </>
  );
}

function SegmentedControlFilter({
  sorting,
  handleSorting,
}: {
  sorting: Sorting;
  handleSorting: (sorting: Sorting) => void;
}) {
  return (
    <>
      <div className="flex my-3 rounded border-2 border-stone-500 border-neutral-600">
        <button
          onClick={() => {
            handleSorting(Sorting.Controversial);
          }}
          className={`bg-transparent rounded-none px-1 transition-colors duration-200 ease-in-out ${
            sorting === "CONTROVERSIAL"
              ? "bg-white text-black hover:bg-white"
              : ""
          }`}
          disabled={sorting === "CONTROVERSIAL" ? true : false}
        >
          Controversial
        </button>
        <button
          onClick={() => {
            handleSorting(Sorting.Unpopular);
          }}
          className={`bg-transparent rounded-none px-1 transition-colors duration-200 ease-in-out ${
            sorting === "UNPOPULAR" ? "bg-white text-black hover:bg-white" : ""
          }`}
          disabled={sorting === "UNPOPULAR" ? true : false}
        >
          Unpopular
        </button>
        <button
          onClick={() => {
            handleSorting(Sorting.Mainstream);
          }}
          className={`bg-transparent rounded-none px-1 transition-colors duration-200 ease-in-out ${
            sorting === "MAINSTREAM" ? "bg-white text-black hover:bg-white" : ""
          }`}
          disabled={sorting === "MAINSTREAM" ? true : false}
        >
          Mainstream
        </button>
      </div>
    </>
  );
}

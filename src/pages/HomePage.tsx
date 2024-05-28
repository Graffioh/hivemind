import { useRef, useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import LoginSection from "../components/LoginSection";
import PostSection from "../components/PostSection";
import { useInView } from "react-intersection-observer";
import { Post } from "../types";

async function fetchPostsPaginated({
  pageParam,
}: {
  pageParam: number;
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
    "http://localhost:8080/post/pagination?page=" + pageParam
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
    }, 1000);
  });
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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [isPostValid, setIsPostValid] = useState(false);

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

  const mutation = useMutation<Post, Error, Post>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handlePost = () => {
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
  };

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className="text-3xl font-bold mt-4">Hivemind</div>
        <div className="flex flex-col w-full">
          <LoginSection />
          <div className="flex flex-col items-center">
            <input
              ref={titleInputRef}
              className="w-64 p-1 rounded border-x-2 border-t-2 border-neutral-600"
              placeholder="Title"
              required
              onChange={() => {
                const areInputsEmpty =
                  titleInputRef.current?.value == "" ||
                  textAreaRef.current?.value == "";
                if (areInputsEmpty) {
                  setIsPostValid(false);
                } else {
                  setIsPostValid(true);
                }
              }}
            ></input>
            <textarea
              ref={textAreaRef}
              rows={10}
              cols={50}
              className="p-1 rounded border-2 border-neutral-600"
              placeholder="Write your thoughts..."
              required
              onChange={() => {
                const areInputsEmpty =
                  titleInputRef.current?.value == "" ||
                  textAreaRef.current?.value == "";
                if (areInputsEmpty) {
                  setIsPostValid(false);
                } else {
                  setIsPostValid(true);
                }
              }}
            ></textarea>
            <button
              onClick={handlePost}
              className="m-4 w-24 h-12 disabled:bg-stone-800"
              disabled={!isPostValid}
            >
              post
            </button>
          </div>
          <div className="flex flex-col mx-20 rounded items-center mt-4">
            <p className="font-bold text-white text-2xl">Thoughts Board</p>
            {data ? (
              data.pages.map((page) => (
                <div
                  key={page.currentPage}
                  className="flex flex-col gap-2 w-full"
                >
                  {page.data.map((post) => (
                    <PostSection key={post.id} post={post} />
                  ))}
                </div>
              ))
            ) : (
              <div>...</div>
            )}
            <div ref={ref}>{isFetchingNextPage && "Loading..."}</div>
          </div>
        </div>
      </div>
    </>
  );
}

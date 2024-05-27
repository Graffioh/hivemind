import { useRef, useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import LoginSection from "../components/LoginSection";
import PostSection from "../components/PostSection";
import { useInView } from "react-intersection-observer";

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

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
        nextPage: (pageParam + 1) * 5 < postsCount ? pageParam + 1 : null,
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
  const queryClient = useQueryClient();

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
      <div className="flex flex-col justify-center items-center">
        <div className="text-3xl font-bold mt-4">Hivemind</div>
        <div className="flex flex-col w-full">
          <LoginSection />
          <div className="flex flex-col items-center">
            <textarea
              ref={textAreaRef}
              rows={10}
              cols={50}
              className="p-1 rounded border-2 border-neutral-600"
            ></textarea>
            <button onClick={handlePost} className="m-4 w-24 h-12">
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

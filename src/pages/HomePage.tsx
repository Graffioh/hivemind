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
import { fetchPostsPaginated, createPost } from "../api/post";

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

  function handleInputChange() {
    const title = titleInputRef.current?.value || "";
    const content = textAreaRef.current?.value || "";
    setIsPostValid(title !== "" && content !== "");
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className="text-3xl font-bold mt-4">Hivemind</div>
        <div className="flex flex-col w-full">
          <LoginSection />
          <PostForm
            titleInputRef={titleInputRef}
            textAreaRef={textAreaRef}
            isPostValid={isPostValid}
            handleInputChange={handleInputChange}
            handlePost={handlePost}
          />
          <ThoughtsBoard
            data={data}
            ref={ref}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </div>
    </>
  );
}

interface PostFormProps {
  titleInputRef: React.RefObject<HTMLInputElement>;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  isPostValid: boolean;
  handleInputChange: () => void;
  handlePost: () => void;
}

function PostForm({
  titleInputRef,
  textAreaRef,
  isPostValid,
  handleInputChange,
  handlePost,
}: PostFormProps) {
  return (
    <div className="flex flex-col items-center">
      <input
        ref={titleInputRef}
        className="w-64 p-1 rounded border-x-2 border-t-2 border-neutral-600"
        placeholder="Title"
        required
        onChange={handleInputChange}
      />
      <textarea
        ref={textAreaRef}
        rows={10}
        cols={50}
        className="p-1 rounded border-2 border-neutral-600"
        placeholder="Write your thoughts..."
        required
        onChange={handleInputChange}
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

interface ThoughtsBoardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  ref: (node?: Element | null | undefined) => void;
  isFetchingNextPage: boolean;
}

function ThoughtsBoard({ data, ref, isFetchingNextPage }: ThoughtsBoardProps) {
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

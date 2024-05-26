import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import CommentSection from "../components/CommentSection";
import VoteArrows from "../components/VoteArrows";
import { useRef } from "react";

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

async function createComment(
  newComment: Comment,
  postId: string
): Promise<Comment> {
  const response = await fetch("http://localhost:8080/comment/" + postId, {
    method: "POST",
    body: JSON.stringify(newComment),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}

export default function PostPage() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("post_id");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Comment,
    Error,
    { newComment: Comment; postId: string }
  >({
    mutationFn: ({ newComment, postId }) => createComment(newComment, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const { data: post, error: postError } = useQuery<Comment>({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId!),
  });

  const { data: comments = [], error: commentsError } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId!),
  });

  if (postError || commentsError) {
    return <span>Error: {postError?.message || commentsError?.message}</span>;
  }

  const handleCommentCreation = () => {
    if (textAreaRef.current && postId) {
      const content = textAreaRef.current.value;

      const newComment: Comment = {
        id: Date.now(),
        post_id: Number(postId),
        user_id: 1,
        content: content,
        created_at: new Date(),
      };

      mutation.mutate({ newComment, postId });

      textAreaRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex flex-col pl-4">
        {post ? (
          <>
            <div className="flex items-center border-b-2">
              <VoteArrows vertical={true} postId={post.id} commentId={null} />
              <div className="flex flex-col">
                <div className="text-stone-400 ml-2 mt-2">
                  {" "}
                  &lt; username &gt;
                </div>
                <div className="flex text-xl pl-2 pb-4">{post.content}</div>
              </div>
            </div>
            <textarea
              ref={textAreaRef}
              rows={3}
              cols={60}
              className="w-fit p-1 mt-6 rounded border-2 border-neutral-600"
            ></textarea>
            <button
              className="my-3 w-20 h-8"
              onClick={handleCommentCreation}
            >
              comment
            </button>
            <div className="">
              <div className="italic mb-2 font-bold text-xl">Comments</div>
              {comments ? (
                <div className="">
                  {comments.map((comment) => (
                    <CommentSection key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <div className="">No comments.</div>
              )}
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

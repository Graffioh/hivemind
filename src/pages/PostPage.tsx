import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import VoteArrows from "../components/VoteArrows";
import { useRef } from "react";
import { Post, Comment, User } from "../types";
import { fetchPost } from "../api/post";
import { fetchComments, createComment } from "../api/comment";
import { fetchUserFromSession, fetchUserFromId } from "../api/user";

export default function PostPage() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("post_id");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation<Comment, Error, Comment>({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["current_user"],
    queryFn: () => fetchUserFromSession(),
  });

  const { data: post, error: postError } = useQuery<Post>({
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

  function handleCommentCreation() {
    if (textAreaRef.current && postId) {
      const content = textAreaRef.current.value;

      const newComment: Comment = {
        id: Date.now(),
        post_id: Number(postId),
        user_id: currentUser!.id, // be careful with !
        content: content,
        created_at: new Date(),
      };

      mutation.mutate(newComment);

      textAreaRef.current.value = "";
    }
  }

  return (
    <>
      <div className="flex flex-col">
        {post ? (
          <>
            <TopSection post={post} />
            <CommentForm
              handleCommentCreation={handleCommentCreation}
              textAreaRef={textAreaRef}
            />
            <CommentsList comments={comments} />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

interface CommentFormProps {
  handleCommentCreation: () => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
}

function CommentForm({ handleCommentCreation, textAreaRef }: CommentFormProps) {
  return (
    <div className="pl-4 flex flex-col">
      <textarea
        ref={textAreaRef}
        rows={3}
        cols={60}
        className="w-fit p-1 mt-6 rounded border-2 border-neutral-600"
      ></textarea>
      <button className="my-3 w-20 h-8" onClick={handleCommentCreation}>
        comment
      </button>
    </div>
  );
}

function TopSection({ post }: { post: Post }) {
  const { data: userByPost } = useQuery<User>({
    queryKey: ["user_post"],
    queryFn: () => fetchUserFromId(post!.user_id), // be careful with !
  });

  return (
    <div className="flex items-center border-b-2 pl-2">
      <VoteArrows vertical={true} postId={post.id} commentId={null} />
      <div className="flex flex-col pl-3 pb-4 mt-2">
        <div className="text-stone-400"> &lt; {userByPost?.username} &gt;</div>
        <div className="text-2xl font-bold mb-1">{post.title}</div>
        <div className="flex text-xl">{post.content}</div>
      </div>
    </div>
  );
}

function CommentsList({ comments }: { comments: Comment[] }) {
  return (
    <div className="pl-4">
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
  );
}

export function CommentSection({ comment }: { comment: Comment }) {
  const { data: userByComment } = useQuery<User>({
    queryKey: ["user_post"],
    queryFn: () => fetchUserFromId(comment!.user_id), // be careful with !
  });

  return (
    <>
      <div className="mb-4 flex flex-col">
        <div className="text-stone-400 mt-2">
          {" "}
          &lt; {userByComment?.username} &gt;
        </div>
        <div className="bg-neutral-800 rounded w-fit p-2 mb-1">
          {comment.content}
        </div>
        <VoteArrows vertical={false} postId={null} commentId={comment.id} />
      </div>
    </>
  );
}

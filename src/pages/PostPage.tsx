import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import VoteArrows from "../components/VoteArrows";
import { useRef, useState } from "react";
import { Post, Comment, User } from "../types";
import { fetchPost } from "../api/post";
import { fetchComments, createComment } from "../api/comment";
import { fetchUserFromSession, fetchUserFromId } from "../api/user";
import LoadingSpinner from "../components/LoadingSpinner";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PostPage() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("post_id");

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

  return (
    <>
      <div className="flex flex-col">
        {post ? (
          <>
            <TopSection post={post} />
            {currentUser ? (
              <CommentForm postId={postId!} currentUserId={currentUser.id} />
            ) : (
              <div className="m-3 text-xl">
                You need to login in order to comment.
              </div>
            )}
            <CommentsList comments={comments} />
          </>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </>
  );
}

function CommentForm({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: number;
}) {
  const [isCommentActive, setIsCommentActive] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation<Comment, Error, Comment>({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  function handleIsCommentActive() {
    const content = textAreaRef.current?.value || "";
    setIsCommentActive(content !== "");
  }

  function handleCommentCreation() {
    if (textAreaRef.current && postId) {
      const content = textAreaRef.current.value;

      const newComment: Comment = {
        id: Date.now(),
        post_id: Number(postId),
        user_id: currentUserId,
        content: content,
        created_at: new Date(),
      };

      mutation.mutate(newComment);

      textAreaRef.current.value = "";
      setIsCommentActive(false);
    }
  }

  return (
    <div className="pl-4 flex flex-col">
      <textarea
        ref={textAreaRef}
        rows={3}
        className="md:w-2/6 p-1 mt-6 rounded border-2 border-neutral-300 mr-4"
        required
        onChange={handleIsCommentActive}
        placeholder="Comment here..."
      ></textarea>
      <button
        className="my-3 w-20 h-8 disabled:bg-stone-800 font-bold"
        onClick={handleCommentCreation}
        disabled={!isCommentActive}
      >
        Comment
      </button>
    </div>
  );
}

function TopSection({ post }: { post: Post }) {
  const { data: userByPost } = useQuery<User>({
    queryKey: ["user_post_section"],
    queryFn: () => fetchUserFromId(post!.user_id), // be careful with !
  });

  return (
    <div className="flex items-center border-b-2 pl-2">
      <div className="flex flex-col w-full">
        <div className="flex">
          <div className="mt-2">
            <VoteArrows vertical={true} postId={post.id} commentId={null} />
          </div>
          <div className="flex flex-col pl-3 pb-4 mt-2">
            <div className="text-stone-400">
              {" "}
              &lt; {userByPost?.username} &gt;
            </div>
            <div className="text-2xl font-bold mb-1">{post.title}</div>
          </div>
        </div>
        {/* <div className="flex text-xl">{post.content}</div> */}
        <div className="ml-16 mb-4">
          <ContentRenderer content={post.content} />
        </div>
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
    queryKey: ["user_comment", comment.user_id],
    queryFn: () => fetchUserFromId(comment!.user_id), // be careful with !
  });

  return (
    <>
      <div className="mb-4 flex flex-col">
        <div className="text-stone-400 mb-2">
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

export function ContentRenderer({ content }: { content: string }) {
  const [isMarkdown, setIsMarkdown] = useState<boolean>(false);

  function handleIsMarkdown(check: boolean) {
    setIsMarkdown(!check);
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isMarkdown}
          onChange={() => {
            handleIsMarkdown(isMarkdown);
          }}
          className=""
        />
        <span className="ml-1">Markdown</span>
      </label>
      {isMarkdown ? (
        <Markdown className="markdown" remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      ) : (
        <div className="my-4">{content}</div>
      )}
    </div>
  );
}

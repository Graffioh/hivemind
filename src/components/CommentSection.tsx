import VoteArrows from "./VoteArrows";
import { Comment } from "../types";

export default function CommentSection({ comment }: { comment: Comment }) {
  return (
    <>
      <div className="mb-4 flex flex-col">
        <div className="text-stone-400 mt-2"> &lt; username &gt;</div>
        <div className="bg-neutral-800 rounded w-fit p-2 mb-1">
          {comment.content}
        </div>
        <VoteArrows vertical={false} postId={null} commentId={comment.id} />
      </div>
    </>
  );
}

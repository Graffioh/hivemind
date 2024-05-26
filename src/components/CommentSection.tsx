import VoteArrows from "./VoteArrows";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export default function CommentSection({ comment }: { comment: Comment }) {
  return (
    <>
      <div className="mb-4 flex flex-col">
        <div className="text-stone-400 mt-2"> &lt; username &gt;</div>
        <div className="bg-neutral-800 rounded w-fit p-2 mb-1">
          {comment.content}
        </div>
          <VoteArrows vertical={false} postId={null} commentId={comment.id}/>
      </div>
    </>
  );
}

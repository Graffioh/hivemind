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
      <div className="mb-4">
        <div className="mb-1 bg-neutral-800 rounded w-fit p-2">
          {comment.content}
        </div>
        <VoteArrows vertical={false} />
      </div>
    </>
  );
}

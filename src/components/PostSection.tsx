import { useNavigate } from "react-router-dom";
import VoteArrows from "./VoteArrows";

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export default function PostSection({ post }: { post: Post }) {
  const navigate = useNavigate();

  function goToPostPage() {
    navigate(`/post-page?post_id=${post.id}`);
  }

  return (
    <>
      <div className="flex flex-col text-left mx-4 w-full">
        <div className="border-b-2 border-stone-600 mx-4 py-3">
          <button
            id="button-post"
            className="w-full py-2 px-1"
            onClick={goToPostPage}
          >
            <div className="text-stone-400 flex"> &lt; username &gt;</div>
            <div key={post.id} className="p-1 pb-4 pt-2 max-w-full text-left">
              {post.content}
            </div>
            <div className="flex">
              <VoteArrows vertical={false} postId={post.id} commentId={null}/>
              <div className="mx-1">
                <button
                  className="px-2"
                >
                  💬
                </button>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

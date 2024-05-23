import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export default function Post({ post }: { post: Post }) {
  const [upVoteCounter, setUpVoteCounter] = useState<number>(post.up_vote ?? 0);
  const [downVoteCounter, setDownVoteCounter] = useState<number>(
    post.down_vote ?? 0
  );

  const navigate = useNavigate();

  function handleUpVoteCounter() {
    setUpVoteCounter(upVoteCounter + 1);
  }

  function handleDownVoteCounter() {
    setDownVoteCounter(downVoteCounter + 1);
  }

  function goToPostPage() {
    navigate(`/post-page?post_id=${post.id}`);
  }

  return (
    <>
      <div className="flex flex-col text-left mx-4">
        <div className="border-b-2 border-stone-600 mx-4 py-3">
          <button id="button-post" className="w-full py-2 px-1"  onClick={goToPostPage}>
            <div className="text-stone-400 flex"> &lt; username &gt;</div>
            <div key={post.id} className="p-1 pb-4 pt-2 max-w-full text-left">
              {post.content}
            </div>
            <div className="flex">
              <div className="mx-2">
                <button onClick={handleUpVoteCounter} className="w-6 h-6">
                  ↑
                </button>
                <p className="ml-2 text-orange-600 inline">{upVoteCounter}</p>
              </div>
              <div className="mx-2">
                <button onClick={handleDownVoteCounter} className="w-6 h-6">
                  ↓
                </button>
                <p className="ml-2 inline text-violet-500">{downVoteCounter}</p>
              </div>
              <div className="mx-1">
                <button className="px-2">💬</button>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

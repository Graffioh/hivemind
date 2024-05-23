import { useState } from "react";

interface Post {
  id: number;
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

  function handleUpVoteCounter() {
    setUpVoteCounter(upVoteCounter + 1);
  }

  function handleDownVoteCounter() {
    setDownVoteCounter(downVoteCounter + 1);
  }

  return (
    <>
      <div className="flex flex-col text-left m-4">
        <div className="ml-4">username</div>
        <div className="border-y-2 border-stone-400 mx-4 mb-2">
          <div key={post.id} className="p-1 max-w-full text-left">
            {post.content}
          </div>
          <div className="flex mb-2">
            <div className="mx-2">
              <button onClick={handleUpVoteCounter} className="w-6 h-6">
                ↑
              </button>
              <a className="ml-2 text-orange-600">{upVoteCounter}</a>
            </div>
            <div className="mx-2">
              <button onClick={handleDownVoteCounter} className="w-6 h-6">
                ↓
              </button>
              <a className="ml-2">{downVoteCounter}</a>
            </div>
            <div className="mx-2">
              <button>comment</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

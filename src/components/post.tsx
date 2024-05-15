import { useState } from "react";

interface Post {
  id: number;
  content: string;
}

export default function Post({ post }: { post: Post }) {
  const [likeCounter, setLikeCounter] = useState<number>(0);
  const [dislikeCounter, setDislikeCounter] = useState<number>(0);

  function handleLikeCounter() {
    setLikeCounter(likeCounter + 1);
  }

  function handleDislikeCounter() {
    setDislikeCounter(dislikeCounter + 1);
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
              <button onClick={handleLikeCounter} className="w-6 h-6">
                ↑
              </button>
              <a className="ml-2 text-orange-600">{likeCounter}</a>
            </div>
            <div className="mx-2">
              <button onClick={handleDislikeCounter} className="w-6 h-6">
                ↓
              </button>
              <a className="ml-2">{dislikeCounter}</a>
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

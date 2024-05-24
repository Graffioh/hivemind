export default function VoteArrows({ vertical }: { vertical: boolean }) {
  // const [upVoteCounter, setUpVoteCounter] = useState<number>(post!.up_vote ?? 0);
  // const [downVoteCounter, setDownVoteCounter] = useState<number>(
  //   post!.down_vote ?? 0
  // );

  // function handleUpVoteCounter() {
  //   setUpVoteCounter(upVoteCounter + 1);
  // }

  // function handleDownVoteCounter() {
  //   setDownVoteCounter(downVoteCounter + 1);
  // }

  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-row"}`}>
      <div className="mx-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            // handleUpVoteCounter();
          }}
          className="w-6 h-6"
        >
          ↑
        </button>
        <p className="ml-2 text-orange-600 inline">{/* {upVoteCounter} */}0</p>
      </div>
      <div className="mx-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            // handleDownVoteCounter();
          }}
          className="w-6 h-6"
        >
          ↓
        </button>
        <p className="ml-2 inline text-violet-500">
          {/* {downVoteCounter} */}0
        </p>
      </div>
    </div>
  );
}

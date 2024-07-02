import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Reaction, Votes, User } from "../types";
import {
  fetchCurrentUserReaction,
  fetchReactionsCounts,
  createReaction,
} from "../api/reaction";
import { fetchUserFromSession } from "../api/user";

export default function VoteArrows({
  vertical,
  postId,
  commentId,
}: {
  vertical: boolean;
  postId: number | null;
  commentId: number | null;
}) {
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isUserLoading } = useQuery<User | null>(
    {
      queryKey: ["current_user"],
      queryFn: () => fetchUserFromSession(),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const { data: votesCount, error: votesCountError } = useQuery<Votes, Error>({
    queryKey: ["reactions_count", { postId, commentId }],
    queryFn: () => fetchReactionsCounts(postId, commentId),
    enabled: postId !== null || commentId !== null,
  });

  const { data: currentUserVote, error: currentUserVoteError } = useQuery<
    number | null,
    Error
  >({
    queryKey: ["reactions", { postId, commentId, userId: currentUser?.id }],
    queryFn: () =>
      currentUser
        ? fetchCurrentUserReaction(postId, commentId, currentUser.id)
        : Promise.resolve(null),
    enabled:
      (postId !== null || commentId !== null) &&
      !!currentUser &&
      !isUserLoading,
  });

  const mutation = useMutation<Reaction, Error, Reaction>({
    mutationFn: createReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reactions_count", { postId, commentId }],
      });
      queryClient.invalidateQueries({
        queryKey: ["reactions", { postId, commentId, userId: currentUser?.id }],
      });
    },
  });

  async function handleVote(reaction: number) {
    if (!currentUser) {
      alert("You must login in order to vote!");
      return;
    }

    const postOrComment: string = postId ? "post" : "comment";
    const newReaction: Reaction = {
      id: Date.now(),
      user_id: currentUser!.id,
      post_id: postId,
      comment_id: commentId,
      reaction_type: postOrComment,
      reaction: reaction,
      created_at: new Date(),
    };

    mutation.mutate(newReaction);
  }

  if (votesCountError || currentUserVoteError) {
    return (
      <span>
        Error:{" "}
        {votesCountError
          ? votesCountError.message
          : currentUserVoteError?.message}
      </span>
    );
  }

  return (
    <>
      <div className={`flex ${vertical ? "flex-col" : "flex-row"}`}>
        <div className="mx-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleVote(1);
            }}
            className={`w-6 h-6 mb-1 ${
              currentUserVote === 1 ? "bg-orange-500 hover:bg-orange-500" : ""
            }`}
          >
            ↑
          </button>
          <p className="ml-2 text-orange-600 inline">{votesCount?.Upvotes}</p>
        </div>
        <div className="mx-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleVote(-1);
            }}
            className={`w-6 h-6 ${
              currentUserVote === -1 ? "bg-violet-500 hover:bg-violet-500" : ""
            }`}
          >
            ↓
          </button>
          <p className="ml-2 inline text-violet-500">{votesCount?.Downvotes}</p>{" "}
        </div>
      </div>
    </>
  );
}

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  up_vote?: number;
  down_vote?: number;
}

export interface Reaction {
  id: number;
  user_id: number;
  post_id: number | null;
  comment_id: number | null;
  reaction_type: string;
  reaction: number;
  created_at: Date;
}

export interface Votes {
  Upvotes: number;
  Downvotes: number;
}

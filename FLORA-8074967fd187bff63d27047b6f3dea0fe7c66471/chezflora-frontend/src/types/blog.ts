
export interface BlogCommentReaction {
  type: "like" | "love" | "laugh";
  count: number;
}

export interface BlogComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  date: string;
  email?: string;
  parentId?: number;
  replies?: BlogComment[];
  reactions?: BlogCommentReaction[];
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  category: string;
  imageUrl: string;
  tags?: string[];
  comments?: BlogComment[];
  viewCount?: number;
  featured?: boolean;
}


// src/domain/entities/comment.entity.ts
export interface CommentEntity {
    id: string;
    blogId: string;
    userId: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}
// src/domain/entities/blog.entity.ts
export interface BlogEntity {
    id: string;
    authorId: string;
    title: string;
    content: string;
    publishDate?: Date;
    category: string;
    status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
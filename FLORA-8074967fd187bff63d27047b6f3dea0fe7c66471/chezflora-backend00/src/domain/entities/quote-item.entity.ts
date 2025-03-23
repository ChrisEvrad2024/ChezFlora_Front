// src/domain/entities/quoteItem.entity.ts
export interface QuoteItemEntity {
    id: string;
    quoteId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
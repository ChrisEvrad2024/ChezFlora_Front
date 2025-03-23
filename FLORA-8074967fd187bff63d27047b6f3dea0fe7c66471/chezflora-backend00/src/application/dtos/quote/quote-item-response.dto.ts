// src/application/dtos/quote/quote-item-response.dto.ts
export interface QuoteItemResponseDto {
    id: string;
    quoteId: string;
    productId?: string;
    productName?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
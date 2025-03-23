// src/application/dtos/quote/quote-item.dto.ts
export interface QuoteItemDto {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
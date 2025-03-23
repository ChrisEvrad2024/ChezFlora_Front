import { QuoteItemResponseDto } from "./quote-item-response.dto";

// src/application/dtos/quote/quote-response.dto.ts
export interface QuoteResponseDto {
    id: string;
    userId: string;
    status: 'requested' | 'processing' | 'sent' | 'accepted' | 'rejected' | 'expired';
    title: string;
    description: string;
    eventType?: string;
    eventDate?: Date;
    validUntil?: Date;
    totalAmount?: number;
    budget?: number;
    customerComment?: string;
    adminComment?: string;
    acceptedAt?: Date;
    rejectedAt?: Date;
    items: QuoteItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
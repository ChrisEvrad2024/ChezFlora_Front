// src/application/dtos/quote/create-quote.dto.ts
export interface CreateQuoteDto {
    title: string;
    description: string;
    eventType?: string;
    eventDate?: Date;
    budget?: number;
    customerComment?: string;
}
// src/application/dtos/quote/respond-to-quote.dto.ts
export interface RespondToQuoteDto {
    action: 'accept' | 'reject';
    customerComment?: string;
}
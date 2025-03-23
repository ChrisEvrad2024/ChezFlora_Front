// src/interfaces/services/quote-service.interface.ts
import { QuoteResponseDto } from '../../application/dtos/quote/quote-response.dto';
import { CreateQuoteDto } from '../../application/dtos/quote/create-quote.dto';
import { UpdateQuoteDto } from '../../application/dtos/quote/update-quote.dto';
import { QuoteItemDto } from '../../application/dtos/quote/quote-item.dto';
import { RespondToQuoteDto } from '../../application/dtos/quote/respond-to-quote.dto';

export interface QuoteServiceInterface {
    getQuoteById(id: string, userId: string): Promise<QuoteResponseDto>;
    getUserQuotes(userId: string, page?: number, limit?: number): Promise<{ quotes: QuoteResponseDto[], total: number, totalPages: number }>;
    getAllQuotes(page?: number, limit?: number, status?: string): Promise<{ quotes: QuoteResponseDto[], total: number, totalPages: number }>;
    createQuote(userId: string, quoteData: CreateQuoteDto): Promise<QuoteResponseDto>;
    updateQuote(id: string, quoteData: UpdateQuoteDto): Promise<QuoteResponseDto>;
    addQuoteItem(quoteId: string, itemData: QuoteItemDto): Promise<void>;
    removeQuoteItem(itemId: string): Promise<boolean>;
    respondToQuote(id: string, userId: string, response: RespondToQuoteDto): Promise<QuoteResponseDto>;
}
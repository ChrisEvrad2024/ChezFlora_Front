// src/interfaces/repositories/quote-repository.interface.ts
import { QuoteResponseDto } from '../../application/dtos/quote/quote-response.dto';
import { CreateQuoteDto } from '../../application/dtos/quote/create-quote.dto';
import { UpdateQuoteDto } from '../../application/dtos/quote/update-quote.dto';
import { QuoteItemDto } from '../../application/dtos/quote/quote-item.dto';
import { RespondToQuoteDto } from '../../application/dtos/quote/respond-to-quote.dto';

export interface QuoteRepositoryInterface {
    findById(id: string): Promise<QuoteResponseDto | null>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{ quotes: QuoteResponseDto[], total: number }>;
    findAll(page?: number, limit?: number, status?: string): Promise<{ quotes: QuoteResponseDto[], total: number }>;
    create(userId: string, quoteData: CreateQuoteDto): Promise<QuoteResponseDto>;
    update(id: string, quoteData: UpdateQuoteDto): Promise<QuoteResponseDto | null>;
    addQuoteItem(quoteId: string, itemData: QuoteItemDto): Promise<void>;
    removeQuoteItem(itemId: string): Promise<boolean>;
    respondToQuote(id: string, userId: string, response: RespondToQuoteDto): Promise<QuoteResponseDto | null>;
    isQuoteActionable(id: string): Promise<boolean>;
}
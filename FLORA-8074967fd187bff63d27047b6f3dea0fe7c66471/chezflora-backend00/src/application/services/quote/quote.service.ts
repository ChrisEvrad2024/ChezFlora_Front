// src/application/services/quote/quote.service.ts
import { QuoteServiceInterface } from '../../../interfaces/services/quote-service.interface';
import { QuoteRepositoryInterface } from '../../../interfaces/repositories/quote-repository.interface';
import { QuoteResponseDto } from '../../dtos/quote/quote-response.dto';
import { CreateQuoteDto } from '../../dtos/quote/create-quote.dto';
import { UpdateQuoteDto } from '../../dtos/quote/update-quote.dto';
import { QuoteItemDto } from '../../dtos/quote/quote-item.dto';
import { RespondToQuoteDto } from '../../dtos/quote/respond-to-quote.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class QuoteService implements QuoteServiceInterface {
    constructor(private quoteRepository: QuoteRepositoryInterface) {}

    async getQuoteById(id: string, userId: string): Promise<QuoteResponseDto> {
        const quote = await this.quoteRepository.findById(id);
        
        if (!quote) {
            throw new AppError('Quote not found', 404);
        }
        
        // Si l'utilisateur n'est pas admin et n'est pas propriétaire du devis
        if (userId !== 'admin' && quote.userId !== userId) {
            throw new AppError('You do not have permission to view this quote', 403);
        }
        
        return quote;
    }

    async getUserQuotes(userId: string, page: number = 1, limit: number = 10): Promise<{ quotes: QuoteResponseDto[], total: number, totalPages: number }> {
        const { quotes, total } = await this.quoteRepository.findByUserId(userId, page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            quotes,
            total,
            totalPages
        };
    }

    async getAllQuotes(page: number = 1, limit: number = 10, status?: string): Promise<{ quotes: QuoteResponseDto[], total: number, totalPages: number }> {
        const { quotes, total } = await this.quoteRepository.findAll(page, limit, status);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            quotes,
            total,
            totalPages
        };
    }

    async createQuote(userId: string, quoteData: CreateQuoteDto): Promise<QuoteResponseDto> {
        // Validation des données du devis
        if (!quoteData.title) {
            throw new AppError('Quote title is required', 400);
        }
        
        if (!quoteData.description) {
            throw new AppError('Quote description is required', 400);
        }
        
        // Si une date d'événement est fournie, vérifier qu'elle est dans le futur
        if (quoteData.eventDate && new Date(quoteData.eventDate) < new Date()) {
            throw new AppError('Event date must be in the future', 400);
        }
        
        return this.quoteRepository.create(userId, quoteData);
    }

    async updateQuote(id: string, quoteData: UpdateQuoteDto): Promise<QuoteResponseDto> {
        const updatedQuote = await this.quoteRepository.update(id, quoteData);
        
        if (!updatedQuote) {
            throw new AppError('Quote not found', 404);
        }
        
        return updatedQuote;
    }

    async addQuoteItem(quoteId: string, itemData: QuoteItemDto): Promise<void> {
        // Validation des données de l'article
        if (!itemData.description) {
            throw new AppError('Item description is required', 400);
        }
        
        if (!itemData.quantity || itemData.quantity <= 0) {
            throw new AppError('Item quantity must be greater than 0', 400);
        }
        
        if (!itemData.unitPrice || itemData.unitPrice <= 0) {
            throw new AppError('Item unit price must be greater than 0', 400);
        }
        
        await this.quoteRepository.addQuoteItem(quoteId, itemData);
    }

    async removeQuoteItem(itemId: string): Promise<boolean> {
        const removed = await this.quoteRepository.removeQuoteItem(itemId);
        
        if (!removed) {
            throw new AppError('Quote item not found', 404);
        }
        
        return true;
    }

    async respondToQuote(id: string, userId: string, response: RespondToQuoteDto): Promise<QuoteResponseDto> {
        // Validation
        if (!id) {
            throw new AppError('Quote ID is required', 400);
        }
        
        if (!response.action) {
            throw new AppError('Response action is required', 400);
        }
        
        if (!['accept', 'reject'].includes(response.action)) {
            throw new AppError('Invalid response action', 400);
        }
        
        // Vérifier si le devis est actionnable
        const isActionable = await this.quoteRepository.isQuoteActionable(id);
        
        if (!isActionable) {
            throw new AppError('This quote cannot be accepted or rejected', 400);
        }
        
        const updatedQuote = await this.quoteRepository.respondToQuote(id, userId, response);
        
        if (!updatedQuote) {
            throw new AppError('Quote not found', 404);
        }
        
        return updatedQuote;
    }
}
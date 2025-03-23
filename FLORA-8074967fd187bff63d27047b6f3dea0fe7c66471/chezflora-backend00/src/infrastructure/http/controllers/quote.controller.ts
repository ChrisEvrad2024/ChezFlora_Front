// src/infrastructure/http/controllers/quote.controller.ts
import { Request, Response, NextFunction } from 'express';
import { QuoteServiceInterface } from '../../../interfaces/services/quote-service.interface';
import { CreateQuoteDto } from '../../../application/dtos/quote/create-quote.dto';
import { UpdateQuoteDto } from '../../../application/dtos/quote/update-quote.dto';
import { QuoteItemDto } from '../../../application/dtos/quote/quote-item.dto';
import { RespondToQuoteDto } from '../../../application/dtos/quote/respond-to-quote.dto';
import { AppError } from '../middlewares/error.middleware';

export class QuoteController {
    constructor(private quoteService: QuoteServiceInterface) {}

    getQuoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const quoteId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const quote = await this.quoteService.getQuoteById(quoteId, userId);

            res.status(200).json({
                success: true,
                message: 'Quote retrieved successfully',
                data: quote
            });
        } catch (error) {
            next(error);
        }
    };

    getUserQuotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const { quotes, total, totalPages } = await this.quoteService.getUserQuotes(userId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Quotes retrieved successfully',
                data: quotes,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getAllQuotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const { quotes, total, totalPages } = await this.quoteService.getAllQuotes(page, limit, status);

            res.status(200).json({
                success: true,
                message: 'Quotes retrieved successfully',
                data: quotes,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    createQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const quoteData: CreateQuoteDto = req.body;
            const quote = await this.quoteService.createQuote(userId, quoteData);

            res.status(201).json({
                success: true,
                message: 'Quote created successfully',
                data: quote
            });
        } catch (error) {
            next(error);
        }
    };

    updateQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const quoteId = req.params.id;

            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const quoteData: UpdateQuoteDto = req.body;
            const quote = await this.quoteService.updateQuote(quoteId, quoteData);

            res.status(200).json({
                success: true,
                message: 'Quote updated successfully',
                data: quote
            });
        } catch (error) {
            next(error);
        }
    };

    addQuoteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const quoteId = req.params.id;

            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const itemData: QuoteItemDto = req.body;
            await this.quoteService.addQuoteItem(quoteId, itemData);

            // Récupérer le devis mis à jour pour l'inclure dans la réponse
            const quote = await this.quoteService.getQuoteById(quoteId, 'admin');

            res.status(200).json({
                success: true,
                message: 'Quote item added successfully',
                data: quote
            });
        } catch (error) {
            next(error);
        }
    };

    removeQuoteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const itemId = req.params.itemId;

            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            await this.quoteService.removeQuoteItem(itemId);

            res.status(200).json({
                success: true,
                message: 'Quote item removed successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    respondToQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const quoteId = req.params.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const responseData: RespondToQuoteDto = req.body;
            const quote = await this.quoteService.respondToQuote(quoteId, userId, responseData);

            res.status(200).json({
                success: true,
                message: `Quote ${responseData.action === 'accept' ? 'accepted' : 'rejected'} successfully`,
                data: quote
            });
        } catch (error) {
            next(error);
        }
    };
}
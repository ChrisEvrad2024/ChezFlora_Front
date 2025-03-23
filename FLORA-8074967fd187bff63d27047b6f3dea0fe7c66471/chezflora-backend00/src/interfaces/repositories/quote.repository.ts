// src/infrastructure/repositories/quote.repository.ts
import { QuoteRepositoryInterface } from '../../interfaces/repositories/quote-repository.interface';
import { QuoteResponseDto } from '../../application/dtos/quote/quote-response.dto';
import { CreateQuoteDto } from '../../application/dtos/quote/create-quote.dto';
import { UpdateQuoteDto } from '../../application/dtos/quote/update-quote.dto';
import { QuoteItemDto } from '../../application/dtos/quote/quote-item.dto';
import { RespondToQuoteDto } from '../../application/dtos/quote/respond-to-quote.dto';
import Quote from '../../infrastructure/database/models/quote.model';
import QuoteItem from '../../infrastructure/database/models/quote-item.model';
import Product from '../../infrastructure/database/models/product.model';
import User from '../../infrastructure/database/models/user.model';
import sequelize  from '../../infrastructure/config/database';
import { AppError } from '../../infrastructure/http/middlewares/error.middleware';
import { Op } from 'sequelize';

export class QuoteRepository implements QuoteRepositoryInterface {
    async findById(id: string): Promise<QuoteResponseDto | null> {
        const quote = await Quote.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: QuoteItem,
                    include: [Product]
                }
            ]
        });

        if (!quote) {
            return null;
        }

        return this.formatQuoteResponse(quote);
    }

    async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ quotes: QuoteResponseDto[], total: number }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await Quote.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: QuoteItem,
                    include: [Product]
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const quotes = rows.map(quote => this.formatQuoteResponse(quote));

        return {
            quotes,
            total: count
        };
    }

    async findAll(page: number = 1, limit: number = 10, status?: string): Promise<{ quotes: QuoteResponseDto[], total: number }> {
        const offset = (page - 1) * limit;
        const where = status ? { status } : {};

        const { rows, count } = await Quote.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: QuoteItem,
                    include: [Product]
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const quotes = rows.map(quote => this.formatQuoteResponse(quote));

        return {
            quotes,
            total: count
        };
    }

    async create(userId: string, quoteData: CreateQuoteDto): Promise<QuoteResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Calculer la date de validité (30 jours par défaut)
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30);

            // Créer le devis
            const quote = await Quote.create(
                {
                    userId,
                    status: 'requested',
                    title: quoteData.title,
                    description: quoteData.description,
                    eventType: quoteData.eventType,
                    eventDate: quoteData.eventDate,
                    budget: quoteData.budget,
                    customerComment: quoteData.customerComment,
                    validUntil
                },
                { transaction }
            );

            await transaction.commit();

            return this.formatQuoteResponse(quote);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(id: string, quoteData: UpdateQuoteDto): Promise<QuoteResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si le devis existe
            const quote = await Quote.findByPk(id, {
                include: [QuoteItem],
                transaction
            });

            if (!quote) {
                await transaction.rollback();
                return null;
            }

            // Vérifier si le devis peut être mis à jour
            if (!['requested', 'processing'].includes(quote.status) && quoteData.status !== 'sent') {
                await transaction.rollback();
                throw new AppError(`Cannot update a quote with status '${quote.status}'`, 400);
            }

            // Mettre à jour le devis
            await quote.update(
                {
                    status: quoteData.status,
                    totalAmount: quoteData.totalAmount,
                    adminComment: quoteData.adminComment,
                    validUntil: quoteData.validUntil
                },
                { transaction }
            );

            // Si des articles sont fournis, supprimer tous les articles existants et ajouter les nouveaux
            if (quoteData.items && quoteData.items.length > 0) {
                // Supprimer les articles existants
                await QuoteItem.destroy({
                    where: { quoteId: id },
                    transaction
                });

                // Ajouter les nouveaux articles
                for (const item of quoteData.items) {
                    await this.addQuoteItem(id, item, transaction);
                }
            }

            // Récupérer le devis mis à jour
            const updatedQuote = await Quote.findByPk(id, {
                include: [
                    {
                        model: QuoteItem,
                        include: [Product]
                    }
                ],
                transaction
            });

            await transaction.commit();

            return this.formatQuoteResponse(updatedQuote);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async addQuoteItem(quoteId: string, itemData: QuoteItemDto, transaction?: any): Promise<void> {
        const newTransaction = transaction || await sequelize.transaction();

        try {
            // Vérifier si le devis existe
            const quote = await Quote.findByPk(quoteId, { transaction: newTransaction });

            if (!quote) {
                if (!transaction) await newTransaction.rollback();
                throw new AppError('Quote not found', 404);
            }

            let productName = null;

            // Si un produit est spécifié, vérifier qu'il existe
            if (itemData.productId) {
                const product = await Product.findByPk(itemData.productId, { transaction: newTransaction });
                if (product) {
                    productName = product.name;
                }
            }

            // Créer l'article de devis
            await QuoteItem.create(
                {
                    quoteId,
                    productId: itemData.productId,
                    description: itemData.description || (productName ? `${productName}` : 'Custom item'),
                    quantity: itemData.quantity,
                    unitPrice: itemData.unitPrice,
                    totalPrice: itemData.unitPrice * itemData.quantity
                },
                { transaction: newTransaction }
            );

            // Mettre à jour le montant total du devis
            const quoteItems = await QuoteItem.findAll({
                where: { quoteId },
                transaction: newTransaction
            });

            const totalAmount = quoteItems.reduce((sum, item) => sum + parseFloat(item.totalPrice.toString()), 0);

            await quote.update(
                { totalAmount },
                { transaction: newTransaction }
            );

            if (!transaction) await newTransaction.commit();
        } catch (error) {
            if (!transaction) await newTransaction.rollback();
            throw error;
        }
    }

    async removeQuoteItem(itemId: string): Promise<boolean> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si l'article existe
            const item = await QuoteItem.findByPk(itemId, {
                include: [Quote],
                transaction
            });

            if (!item) {
                await transaction.rollback();
                return false;
            }

            // Vérifier si le devis peut être modifié
            if (!['requested', 'processing'].includes(item.quote.status)) {
                await transaction.rollback();
                throw new AppError(`Cannot update a quote with status '${item.quote.status}'`, 400);
            }

            // Supprimer l'article
            await item.destroy({ transaction });

            // Mettre à jour le montant total du devis
            const quoteItems = await QuoteItem.findAll({
                where: { quoteId: item.quoteId },
                transaction
            });

            const totalAmount = quoteItems.reduce((sum, item) => sum + parseFloat(item.totalPrice.toString()), 0);

            await item.quote.update(
                { totalAmount },
                { transaction }
            );

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async respondToQuote(id: string, userId: string, response: RespondToQuoteDto): Promise<QuoteResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si le devis existe et appartient à l'utilisateur
            const quote = await Quote.findOne({
                where: {
                    id,
                    userId
                },
                include: [QuoteItem],
                transaction
            });

            if (!quote) {
                await transaction.rollback();
                return null;
            }

            // Vérifier si le devis est en statut 'sent'
            if (quote.status !== 'sent') {
                await transaction.rollback();
                throw new AppError('Only quotes with status "sent" can be accepted or rejected', 400);
            }

            // Vérifier si le devis n'est pas expiré
            if (quote.validUntil && new Date() > quote.validUntil) {
                await transaction.rollback();
                throw new AppError('This quote has expired', 400);
            }

            // Préparer les données à mettre à jour
            const updateData: any = {
                status: response.action === 'accept' ? 'accepted' : 'rejected'
            };

            if (response.customerComment) {
                updateData.customerComment = response.customerComment;
            }

            if (response.action === 'accept') {
                updateData.acceptedAt = new Date();
            } else {
                updateData.rejectedAt = new Date();
            }

            // Mettre à jour le devis
            await quote.update(updateData, { transaction });

            // Récupérer le devis mis à jour
            const updatedQuote = await Quote.findByPk(id, {
                include: [
                    {
                        model: QuoteItem,
                        include: [Product]
                    }
                ],
                transaction
            });

            await transaction.commit();

            return this.formatQuoteResponse(updatedQuote);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async isQuoteActionable(id: string): Promise<boolean> {
        const quote = await Quote.findByPk(id);

        if (!quote) {
            return false;
        }

        // Un devis est actionnable s'il est en statut 'sent' et n'est pas expiré
        return (
            quote.status === 'sent' &&
            (!quote.validUntil || new Date() <= quote.validUntil)
        );
    }

    private formatQuoteResponse(quote: any): QuoteResponseDto {
        return {
            id: quote.id,
            userId: quote.userId,
            status: quote.status,
            title: quote.title,
            description: quote.description,
            eventType: quote.eventType,
            eventDate: quote.eventDate,
            validUntil: quote.validUntil,
            totalAmount: quote.totalAmount ? parseFloat(quote.totalAmount.toString()) : undefined,
            budget: quote.budget ? parseFloat(quote.budget.toString()) : undefined,
            customerComment: quote.customerComment,
            adminComment: quote.adminComment,
            acceptedAt: quote.acceptedAt,
            rejectedAt: quote.rejectedAt,
            items: quote.items?.map((item: any) => ({
                id: item.id,
                quoteId: item.quoteId,
                productId: item.productId,
                productName: item.product?.name,
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice.toString()),
                totalPrice: parseFloat(item.totalPrice.toString()),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            })) || [],
            createdAt: quote.createdAt,
            updatedAt: quote.updatedAt
        };
    }
}
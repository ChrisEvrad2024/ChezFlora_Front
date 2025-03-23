// src/infrastructure/repositories/newsletter.repository.ts
import { NewsletterRepositoryInterface } from '../../interfaces/repositories/newsletter-repository.interface';
import { NewsletterSubscriptionResponseDto } from '../../application/dtos/newsletter/newsletter-subscription-response.dto';
import NewsletterSubscription from '../database/models/newsletter-subscription.model';
import User from '../database/models/user.model';
import  sequelize  from '../config/database';
import { AppError } from '../http/middlewares/error.middleware';
import crypto from 'crypto';

export class NewsletterRepository implements NewsletterRepositoryInterface {
    async findByEmail(email: string): Promise<NewsletterSubscriptionResponseDto | null> {
        const subscription = await NewsletterSubscription.findOne({
            where: { email }
        });

        if (!subscription) {
            return null;
        }

        return this.formatSubscriptionResponse(subscription);
    }

    async findByToken(token: string): Promise<NewsletterSubscriptionResponseDto | null> {
        const subscription = await NewsletterSubscription.findOne({
            where: { token }
        });

        if (!subscription) {
            return null;
        }

        return this.formatSubscriptionResponse(subscription);
    }

    async findByUserId(userId: string): Promise<NewsletterSubscriptionResponseDto | null> {
        const subscription = await NewsletterSubscription.findOne({
            where: { userId }
        });

        if (!subscription) {
            return null;
        }

        return this.formatSubscriptionResponse(subscription);
    }

    async subscribe(email: string, userId?: string): Promise<NewsletterSubscriptionResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si l'email est déjà abonné
            const existingSubscription = await NewsletterSubscription.findOne({
                where: { email },
                transaction
            });

            // Si l'abonnement existe déjà mais est inactif, on le réactive
            if (existingSubscription && !existingSubscription.active) {
                // Générer un nouveau token de confirmation
                const token = crypto.randomBytes(32).toString('hex');

                await existingSubscription.update({
                    active: true,
                    token,
                    userId,
                    confirmedAt: null
                }, { transaction });

                await transaction.commit();
                return this.formatSubscriptionResponse(existingSubscription);
            }
            // Si l'abonnement existe déjà et est actif
            else if (existingSubscription && existingSubscription.active) {
                await transaction.rollback();
                throw new AppError('Email already subscribed to newsletter', 400);
            }

            // Générer un token de confirmation
            const token = crypto.randomBytes(32).toString('hex');

            // Créer l'abonnement
            const subscription = await NewsletterSubscription.create({
                email,
                userId,
                token,
                active: true, // L'abonnement est actif mais pas confirmé
                confirmedAt: null
            }, { transaction });

            await transaction.commit();
            return this.formatSubscriptionResponse(subscription);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async confirmSubscription(token: string): Promise<NewsletterSubscriptionResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            const subscription = await NewsletterSubscription.findOne({
                where: { token },
                transaction
            });

            if (!subscription) {
                await transaction.rollback();
                return null;
            }

            // Mettre à jour l'abonnement
            await subscription.update({
                confirmedAt: new Date(),
                token: null // Effacer le token après confirmation
            }, { transaction });

            await transaction.commit();
            return this.formatSubscriptionResponse(subscription);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async unsubscribe(email: string): Promise<boolean> {
        const transaction = await sequelize.transaction();

        try {
            const subscription = await NewsletterSubscription.findOne({
                where: { email },
                transaction
            });

            if (!subscription) {
                await transaction.rollback();
                return false;
            }

            // Désactiver l'abonnement au lieu de le supprimer
            await subscription.update({
                active: false
            }, { transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getAllSubscribers(page: number = 1, limit: number = 10, active: boolean = true): Promise<{ subscriptions: NewsletterSubscriptionResponseDto[], total: number }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await NewsletterSubscription.findAndCountAll({
            where: { active },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const subscriptions = rows.map(subscription => this.formatSubscriptionResponse(subscription));

        return {
            subscriptions,
            total: count
        };
    }

    private formatSubscriptionResponse(subscription: any): NewsletterSubscriptionResponseDto {
        return {
            id: subscription.id,
            email: subscription.email,
            userId: subscription.userId,
            active: subscription.active,
            confirmedAt: subscription.confirmedAt,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt
        };
    }
}
// src/infrastructure/http/controllers/newsletter.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NewsletterServiceInterface } from '../../../interfaces/services/newsletter-service.interface';
import { SubscribeToNewsletterDto } from '../../../application/dtos/newsletter/subscribe-to-newsletter.dto';
import { ConfirmSubscriptionDto } from '../../../application/dtos/newsletter/confirm-subscription.dto';
import { UnsubscribeFromNewsletterDto } from '../../../application/dtos/newsletter/unsubscribe-from-newsletter.dto';
import { AppError } from '../middlewares/error.middleware';

export class NewsletterController {
    constructor(private newsletterService: NewsletterServiceInterface) {}

    subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: SubscribeToNewsletterDto = req.body;
            const userId = req.user?.id;

            const subscription = await this.newsletterService.subscribe(data, userId);

            res.status(201).json({
                success: true,
                message: 'Subscribed to newsletter successfully. Check your email to confirm subscription.',
                data: {
                    email: subscription.email,
                    active: subscription.active,
                    confirmed: !!subscription.confirmedAt
                }
            });
        } catch (error) {
            next(error);
        }
    };

    confirmSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: ConfirmSubscriptionDto = { token: req.params.token };

            const subscription = await this.newsletterService.confirmSubscription(data);

            res.status(200).json({
                success: true,
                message: 'Newsletter subscription confirmed successfully',
                data: {
                    email: subscription.email,
                    active: subscription.active,
                    confirmed: !!subscription.confirmedAt
                }
            });
        } catch (error) {
            next(error);
        }
    };

    unsubscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: UnsubscribeFromNewsletterDto = req.body;

            await this.newsletterService.unsubscribe(data);

            res.status(200).json({
                success: true,
                message: 'Unsubscribed from newsletter successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const email = req.params.email;

            const status = await this.newsletterService.getSubscriptionStatus(email);

            res.status(200).json({
                success: true,
                message: 'Subscription status retrieved successfully',
                data: status
            });
        } catch (error) {
            next(error);
        }
    };

    getAllSubscribers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const active = req.query.active !== 'false';

            const { subscriptions, total, totalPages } = await this.newsletterService.getAllSubscribers(page, limit, active);

            res.status(200).json({
                success: true,
                message: 'Subscribers retrieved successfully',
                data: subscriptions,
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
}
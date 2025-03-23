// src/application/services/promotion/newsletter.service.ts
import { NewsletterServiceInterface } from '../../../interfaces/services/newsletter-service.interface';
import { NewsletterRepositoryInterface } from '../../../interfaces/repositories/newsletter-repository.interface';
import { NewsletterSubscriptionResponseDto } from '../../dtos/newsletter/newsletter-subscription-response.dto';
import { SubscribeToNewsletterDto } from '../../dtos/newsletter/subscribe-to-newsletter.dto';
import { ConfirmSubscriptionDto } from '../../dtos/newsletter/confirm-subscription.dto';
import { UnsubscribeFromNewsletterDto } from '../../dtos/newsletter/unsubscribe-from-newsletter.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class NewsletterService implements NewsletterServiceInterface {
    constructor(private newsletterRepository: NewsletterRepositoryInterface) {}

    async subscribe(data: SubscribeToNewsletterDto, userId?: string): Promise<NewsletterSubscriptionResponseDto> {
        if (!data.email) {
            throw new AppError('Email is required', 400);
        }
        
        // Valider le format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new AppError('Invalid email format', 400);
        }
        
        try {
            const subscription = await this.newsletterRepository.subscribe(data.email, userId);
            
            // Ici, on pourrait envoyer un email de confirmation avec le token
            // Par exemple, avec un service d'email:
            // this.emailService.sendConfirmationEmail(data.email, subscription.token);
            
            return subscription;
        } catch (error) {
            throw error;
        }
    }

    async confirmSubscription(data: ConfirmSubscriptionDto): Promise<NewsletterSubscriptionResponseDto> {
        if (!data.token) {
            throw new AppError('Token is required', 400);
        }
        
        const subscription = await this.newsletterRepository.confirmSubscription(data.token);
        
        if (!subscription) {
            throw new AppError('Invalid or expired token', 400);
        }
        
        return subscription;
    }

    async unsubscribe(data: UnsubscribeFromNewsletterDto): Promise<boolean> {
        if (!data.email) {
            throw new AppError('Email is required', 400);
        }
        
        const result = await this.newsletterRepository.unsubscribe(data.email);
        
        return result;
    }

    async getSubscriptionStatus(email: string): Promise<{ subscribed: boolean; confirmed: boolean }> {
        const subscription = await this.newsletterRepository.findByEmail(email);
        
        if (!subscription) {
            return { subscribed: false, confirmed: false };
        }
        
        return {
            subscribed: subscription.active,
            confirmed: !!subscription.confirmedAt
        };
    }

    async getAllSubscribers(page: number = 1, limit: number = 10, active: boolean = true): Promise<{ subscriptions: NewsletterSubscriptionResponseDto[], total: number, totalPages: number }> {
        const { subscriptions, total } = await this.newsletterRepository.getAllSubscribers(page, limit, active);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            subscriptions,
            total,
            totalPages
        };
    }
}
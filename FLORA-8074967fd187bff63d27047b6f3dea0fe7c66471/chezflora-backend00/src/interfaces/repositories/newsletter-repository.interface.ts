// src/interfaces/repositories/newsletter-repository.interface.ts
import { NewsletterSubscriptionResponseDto } from '../../application/dtos/newsletter/newsletter-subscription-response.dto';

export interface NewsletterRepositoryInterface {
    findByEmail(email: string): Promise<NewsletterSubscriptionResponseDto | null>;
    findByToken(token: string): Promise<NewsletterSubscriptionResponseDto | null>;
    findByUserId(userId: string): Promise<NewsletterSubscriptionResponseDto | null>;
    subscribe(email: string, userId?: string): Promise<NewsletterSubscriptionResponseDto>;
    confirmSubscription(token: string): Promise<NewsletterSubscriptionResponseDto | null>;
    unsubscribe(email: string): Promise<boolean>;
    getAllSubscribers(page?: number, limit?: number, active?: boolean): Promise<{ subscriptions: NewsletterSubscriptionResponseDto[], total: number }>;
}
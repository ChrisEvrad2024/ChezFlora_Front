// src/interfaces/services/newsletter-service.interface.ts
import { NewsletterSubscriptionResponseDto } from '../../application/dtos/newsletter/newsletter-subscription-response.dto';
import { SubscribeToNewsletterDto } from '../../application/dtos/newsletter/subscribe-to-newsletter.dto';
import { ConfirmSubscriptionDto } from '../../application/dtos/newsletter/confirm-subscription.dto';
import { UnsubscribeFromNewsletterDto } from '../../application/dtos/newsletter/unsubscribe-from-newsletter.dto';

export interface NewsletterServiceInterface {
    subscribe(data: SubscribeToNewsletterDto, userId?: string): Promise<NewsletterSubscriptionResponseDto>;
    confirmSubscription(data: ConfirmSubscriptionDto): Promise<NewsletterSubscriptionResponseDto>;
    unsubscribe(data: UnsubscribeFromNewsletterDto): Promise<boolean>;
    getSubscriptionStatus(email: string): Promise<{ subscribed: boolean; confirmed: boolean }>;
    getAllSubscribers(page?: number, limit?: number, active?: boolean): Promise<{ subscriptions: NewsletterSubscriptionResponseDto[], total: number, totalPages: number }>;
}
// src/application/dtos/newsletter/newsletter-subscription-response.dto.ts
export interface NewsletterSubscriptionResponseDto {
    id: string;
    email: string;
    userId?: string;
    active: boolean;
    confirmedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
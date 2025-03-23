// src/domain/entities/promotion.entity.ts
export interface PromotionEntity {
    id: string;
    name: string;
    description: string;
    discount: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
// src/domain/entities/serviceImage.entity.ts
export interface ServiceImageEntity {
    id: string;
    serviceId: string;
    url: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
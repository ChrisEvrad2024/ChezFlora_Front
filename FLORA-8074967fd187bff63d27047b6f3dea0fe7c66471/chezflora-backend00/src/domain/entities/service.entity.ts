// src/domain/entities/service.entity.ts
export interface ServiceEntity {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}
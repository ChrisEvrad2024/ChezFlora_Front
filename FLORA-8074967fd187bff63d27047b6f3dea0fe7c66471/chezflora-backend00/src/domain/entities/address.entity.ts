// src/domain/entities/address.entity.ts
export interface AddressEntity {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    street: string;
    zipCode: string;
    city: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

















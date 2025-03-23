// src/application/dtos/address/address-response.dto.ts
export interface AddressResponseDto {
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
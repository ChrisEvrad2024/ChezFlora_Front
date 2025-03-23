// src/application/dtos/address/create-address.dto.ts
export interface CreateAddressDto {
    firstName: string;
    lastName: string;
    street: string;
    zipCode: string;
    city: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}
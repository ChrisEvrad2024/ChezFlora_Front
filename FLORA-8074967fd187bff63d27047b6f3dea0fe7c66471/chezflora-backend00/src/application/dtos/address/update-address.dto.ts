// src/application/dtos/address/update-address.dto.ts
export interface UpdateAddressDto {
    firstName?: string;
    lastName?: string;
    street?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
}
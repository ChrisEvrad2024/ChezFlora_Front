// src/interfaces/services/address-service.interface.ts
import { AddressResponseDto } from '../../application/dtos/address/address-response.dto';
import { CreateAddressDto } from '../../application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '../../application/dtos/address/update-address.dto';

export interface AddressServiceInterface {
    getUserAddresses(userId: string): Promise<AddressResponseDto[]>;
    getAddressById(id: string): Promise<AddressResponseDto | null>;
    createAddress(userId: string, addressData: CreateAddressDto): Promise<AddressResponseDto>;
    updateAddress(id: string, userId: string, addressData: UpdateAddressDto): Promise<AddressResponseDto | null>;
    deleteAddress(id: string, userId: string): Promise<boolean>;
    setDefaultAddress(userId: string, addressId: string): Promise<boolean>;
    getDefaultAddress(userId: string): Promise<AddressResponseDto | null>;
}
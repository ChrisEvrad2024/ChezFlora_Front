// src/interfaces/repositories/address-repository.interface.ts
import { AddressResponseDto } from '../../application/dtos/address/address-response.dto';
import { CreateAddressDto } from '../../application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '../../application/dtos/address/update-address.dto';

export interface AddressRepositoryInterface {
    findById(id: string): Promise<AddressResponseDto | null>;
    findByUserId(userId: string): Promise<AddressResponseDto[]>;
    findDefaultByUserId(userId: string): Promise<AddressResponseDto | null>;
    create(userId: string, addressData: CreateAddressDto): Promise<AddressResponseDto>;
    update(id: string, addressData: UpdateAddressDto): Promise<AddressResponseDto | null>;
    delete(id: string): Promise<boolean>;
    setDefault(userId: string, addressId: string): Promise<boolean>;
}
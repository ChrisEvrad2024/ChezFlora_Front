// src/application/services/user/address.service.ts
import { AddressServiceInterface } from '../../../interfaces/services/address-service.interface';
import { AddressRepositoryInterface } from '../../../interfaces/repositories/address-repository.interface';
import { AddressResponseDto } from '../../dtos/address/address-response.dto';
import { CreateAddressDto } from '../../dtos/address/create-address.dto';
import { UpdateAddressDto } from '../../dtos/address/update-address.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class AddressService implements AddressServiceInterface {
    constructor(private addressRepository: AddressRepositoryInterface) {}

    async getUserAddresses(userId: string): Promise<AddressResponseDto[]> {
        return this.addressRepository.findByUserId(userId);
    }

    async getAddressById(id: string): Promise<AddressResponseDto | null> {
        const address = await this.addressRepository.findById(id);
        
        if (!address) {
            throw new AppError('Address not found', 404);
        }
        
        return address;
    }

    async createAddress(userId: string, addressData: CreateAddressDto): Promise<AddressResponseDto> {
        if (!addressData.firstName || !addressData.lastName || !addressData.street || 
            !addressData.zipCode || !addressData.city || !addressData.country) {
            throw new AppError('Missing required address fields', 400);
        }
        
        return this.addressRepository.create(userId, addressData);
    }

    async updateAddress(id: string, userId: string, addressData: UpdateAddressDto): Promise<AddressResponseDto | null> {
        const address = await this.addressRepository.findById(id);
        
        if (!address) {
            throw new AppError('Address not found', 404);
        }
        
        if (address.userId !== userId) {
            throw new AppError('You do not have permission to update this address', 403);
        }
        
        return this.addressRepository.update(id, addressData);
    }

    async deleteAddress(id: string, userId: string): Promise<boolean> {
        const address = await this.addressRepository.findById(id);
        
        if (!address) {
            throw new AppError('Address not found', 404);
        }
        
        if (address.userId !== userId) {
            throw new AppError('You do not have permission to delete this address', 403);
        }
        
        return this.addressRepository.delete(id);
    }

    async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
        const address = await this.addressRepository.findById(addressId);
        
        if (!address) {
            throw new AppError('Address not found', 404);
        }
        
        if (address.userId !== userId) {
            throw new AppError('You do not have permission to modify this address', 403);
        }
        
        return this.addressRepository.setDefault(userId, addressId);
    }

    async getDefaultAddress(userId: string): Promise<AddressResponseDto | null> {
        return this.addressRepository.findDefaultByUserId(userId);
    }
}
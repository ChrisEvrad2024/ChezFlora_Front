// src/infrastructure/http/controllers/address.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AddressServiceInterface } from '../../../interfaces/services/address-service.interface';
import { CreateAddressDto } from '../../../application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '../../../application/dtos/address/update-address.dto';
import { AppError } from '../middlewares/error.middleware';

export class AddressController {
    constructor(private addressService: AddressServiceInterface) {}

    getUserAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const addresses = await this.addressService.getUserAddresses(userId);
            
            res.status(200).json({
                success: true,
                message: 'Addresses retrieved successfully',
                data: addresses
            });
        } catch (error) {
            next(error);
        }
    };

    getAddressById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const address = await this.addressService.getAddressById(addressId);
            
            if (!address) {
                throw new AppError('Address not found', 404);
            }
            
            if (address.userId !== userId) {
                throw new AppError('You do not have permission to view this address', 403);
            }
            
            res.status(200).json({
                success: true,
                message: 'Address retrieved successfully',
                data: address
            });
        } catch (error) {
            next(error);
        }
    };

    createAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const addressData: CreateAddressDto = req.body;
            const newAddress = await this.addressService.createAddress(userId, addressData);
            
            res.status(201).json({
                success: true,
                message: 'Address created successfully',
                data: newAddress
            });
        } catch (error) {
            next(error);
        }
    };

    updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const addressData: UpdateAddressDto = req.body;
            const updatedAddress = await this.addressService.updateAddress(addressId, userId, addressData);
            
            res.status(200).json({
                success: true,
                message: 'Address updated successfully',
                data: updatedAddress
            });
        } catch (error) {
            next(error);
        }
    };

    deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            await this.addressService.deleteAddress(addressId, userId);
            
            res.status(200).json({
                success: true,
                message: 'Address deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    setDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            await this.addressService.setDefaultAddress(userId, addressId);
            
            res.status(200).json({
                success: true,
                message: 'Default address set successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const defaultAddress = await this.addressService.getDefaultAddress(userId);
            
            res.status(200).json({
                success: true,
                message: 'Default address retrieved successfully',
                data: defaultAddress
            });
        } catch (error) {
            next(error);
        }
    };
}
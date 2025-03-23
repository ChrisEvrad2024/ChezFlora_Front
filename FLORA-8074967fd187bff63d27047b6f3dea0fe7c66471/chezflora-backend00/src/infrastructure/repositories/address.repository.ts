// src/infrastructure/repositories/address.repository.ts
import { AddressRepositoryInterface } from '../../interfaces/repositories/address-repository.interface';
import { AddressResponseDto } from '../../application/dtos/address/address-response.dto';
import { CreateAddressDto } from '../../application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '../../application/dtos/address/update-address.dto';
import Address from '../database/models/address.model';
import { Op } from 'sequelize';
import  sequelize  from '../config/database';

export class AddressRepository implements AddressRepositoryInterface {
    async findById(id: string): Promise<AddressResponseDto | null> {
        const address = await Address.findByPk(id);
        return address ? address.toJSON() as AddressResponseDto : null;
    }

    async findByUserId(userId: string): Promise<AddressResponseDto[]> {
        const addresses = await Address.findAll({ 
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
        return addresses.map(address => address.toJSON() as AddressResponseDto);
    }

    async findDefaultByUserId(userId: string): Promise<AddressResponseDto | null> {
        const address = await Address.findOne({
            where: {
                userId,
                isDefault: true
            }
        });
        return address ? address.toJSON() as AddressResponseDto : null;
    }

    async create(userId: string, addressData: CreateAddressDto): Promise<AddressResponseDto> {
        const transaction = await sequelize.transaction();
        
        try {
            // Si la nouvelle adresse est définie comme par défaut, mettre à jour les autres adresses
            if (addressData.isDefault) {
                await Address.update(
                    { isDefault: false },
                    { 
                        where: { 
                            userId,
                            isDefault: true
                        },
                        transaction
                    }
                );
            }
            
            // S'il n'y a pas encore d'adresse pour cet utilisateur, définir celle-ci comme par défaut
            const existingAddressCount = await Address.count({ 
                where: { userId },
                transaction
            });
            
            if (existingAddressCount === 0) {
                addressData.isDefault = true;
            }
            
            // Créer la nouvelle adresse
            const address = await Address.create(
                { 
                    ...addressData,
                    userId 
                },
                { transaction }
            );
            
            await transaction.commit();
            return address.toJSON() as AddressResponseDto;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(id: string, addressData: UpdateAddressDto): Promise<AddressResponseDto | null> {
        const transaction = await sequelize.transaction();
        
        try {
            const address = await Address.findByPk(id, { transaction });
            
            if (!address) {
                await transaction.rollback();
                return null;
            }
            
            // Si l'adresse est mise à jour pour être par défaut, mettre à jour les autres adresses
            if (addressData.isDefault) {
                await Address.update(
                    { isDefault: false },
                    { 
                        where: { 
                            userId: address.userId,
                            isDefault: true,
                            id: { [Op.ne]: id }
                        },
                        transaction
                    }
                );
            }
            
            await address.update(addressData, { transaction });
            
            await transaction.commit();
            return address.toJSON() as AddressResponseDto;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        const transaction = await sequelize.transaction();
        
        try {
            const address = await Address.findByPk(id, { transaction });
            
            if (!address) {
                await transaction.rollback();
                return false;
            }
            
            const wasDefault = address.isDefault;
            const userId = address.userId;
            
            const deleted = await Address.destroy({ 
                where: { id },
                transaction
            });
            
            // Si l'adresse supprimée était par défaut, définir une autre adresse comme par défaut
            if (wasDefault) {
                const anotherAddress = await Address.findOne({
                    where: { userId },
                    transaction
                });
                
                if (anotherAddress) {
                    await anotherAddress.update({ isDefault: true }, { transaction });
                }
            }
            
            await transaction.commit();
            return deleted > 0;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async setDefault(userId: string, addressId: string): Promise<boolean> {
        const transaction = await sequelize.transaction();
        
        try {
            // Vérifier si l'adresse existe et appartient à l'utilisateur
            const address = await Address.findOne({
                where: {
                    id: addressId,
                    userId
                },
                transaction
            });
            
            if (!address) {
                await transaction.rollback();
                return false;
            }
            
            // Mettre à jour toutes les adresses de l'utilisateur pour ne plus être par défaut
            await Address.update(
                { isDefault: false },
                { 
                    where: { 
                        userId,
                        isDefault: true
                    },
                    transaction
                }
            );
            
            // Définir l'adresse spécifiée comme par défaut
            await address.update({ isDefault: true }, { transaction });
            
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
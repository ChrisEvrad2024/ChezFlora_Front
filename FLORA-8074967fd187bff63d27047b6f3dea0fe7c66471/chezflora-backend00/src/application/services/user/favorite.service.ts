// src/application/services/user/favorite.service.ts
import { FavoriteServiceInterface } from '../../../interfaces/services/favorite-service.interface';
import { FavoriteRepositoryInterface } from '../../../interfaces/repositories/favorite-repository.interface';
import { FavoriteResponseDto } from '../../dtos/favorite/favorite-response.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class FavoriteService implements FavoriteServiceInterface {
    constructor(private favoriteRepository: FavoriteRepositoryInterface) {}

    async getUserFavorites(userId: string, page: number = 1, limit: number = 10): Promise<{ favorites: FavoriteResponseDto[], total: number, totalPages: number }> {
        const { favorites, total } = await this.favoriteRepository.findByUserId(userId, page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            favorites,
            total,
            totalPages
        };
    }

    async checkIfFavorite(userId: string, productId: string): Promise<boolean> {
        if (!productId) {
            throw new AppError('Product ID is required', 400);
        }
        
        return this.favoriteRepository.checkIfFavorite(userId, productId);
    }

    async addToFavorites(userId: string, productId: string): Promise<FavoriteResponseDto> {
        if (!productId) {
            throw new AppError('Product ID is required', 400);
        }
        
        return this.favoriteRepository.addToFavorites(userId, productId);
    }

    async removeFromFavorites(userId: string, productId: string): Promise<boolean> {
        if (!productId) {
            throw new AppError('Product ID is required', 400);
        }
        
        const removed = await this.favoriteRepository.removeFromFavorites(userId, productId);
        
        if (!removed) {
            throw new AppError('Product not found in favorites', 404);
        }
        
        return true;
    }
}
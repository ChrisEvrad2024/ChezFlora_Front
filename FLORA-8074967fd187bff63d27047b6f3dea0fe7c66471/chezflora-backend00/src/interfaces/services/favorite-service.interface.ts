// src/interfaces/services/favorite-service.interface.ts
import { FavoriteResponseDto } from '../../application/dtos/favorite/favorite-response.dto';

export interface FavoriteServiceInterface {
    getUserFavorites(userId: string, page?: number, limit?: number): Promise<{ favorites: FavoriteResponseDto[], total: number, totalPages: number }>;
    checkIfFavorite(userId: string, productId: string): Promise<boolean>;
    addToFavorites(userId: string, productId: string): Promise<FavoriteResponseDto>;
    removeFromFavorites(userId: string, productId: string): Promise<boolean>;
}
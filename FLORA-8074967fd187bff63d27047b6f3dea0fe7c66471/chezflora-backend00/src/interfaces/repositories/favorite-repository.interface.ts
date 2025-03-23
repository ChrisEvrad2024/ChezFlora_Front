// src/interfaces/repositories/favorite-repository.interface.ts
import { FavoriteResponseDto } from '../../application/dtos/favorite/favorite-response.dto';

export interface FavoriteRepositoryInterface {
    findByUserId(userId: string, page?: number, limit?: number): Promise<{ favorites: FavoriteResponseDto[], total: number }>;
    checkIfFavorite(userId: string, productId: string): Promise<boolean>;
    addToFavorites(userId: string, productId: string): Promise<FavoriteResponseDto>;
    removeFromFavorites(userId: string, productId: string): Promise<boolean>;
}
// src/infrastructure/http/controllers/favorite.controller.ts
import { Request, Response, NextFunction } from 'express';
import { FavoriteServiceInterface } from '../../../interfaces/services/favorite-service.interface';
import { AddToFavoritesDto } from '../../../application/dtos/favorite/add-to-favorites.dto';
import { AppError } from '../middlewares/error.middleware';

export class FavoriteController {
    constructor(private favoriteService: FavoriteServiceInterface) {}

    getUserFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const { favorites, total, totalPages } = await this.favoriteService.getUserFavorites(userId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Favorites retrieved successfully',
                data: favorites,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    checkIfFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const productId = req.params.productId;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const isFavorite = await this.favoriteService.checkIfFavorite(userId, productId);

            res.status(200).json({
                success: true,
                message: 'Favorite status checked successfully',
                data: { isFavorite }
            });
        } catch (error) {
            next(error);
        }
    };

    addToFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const { productId }: AddToFavoritesDto = req.body;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const favorite = await this.favoriteService.addToFavorites(userId, productId);

            res.status(201).json({
                success: true,
                message: 'Product added to favorites successfully',
                data: favorite
            });
        } catch (error) {
            next(error);
        }
    };

    removeFromFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const productId = req.params.productId;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            await this.favoriteService.removeFromFavorites(userId, productId);

            res.status(200).json({
                success: true,
                message: 'Product removed from favorites successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}
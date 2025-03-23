// src/infrastructure/repositories/favorite.repository.ts
import { FavoriteRepositoryInterface } from '../../interfaces/repositories/favorite-repository.interface';
import { FavoriteResponseDto } from '../../application/dtos/favorite/favorite-response.dto';
import Favorite from '../database/models/favorite.model';
import Product from '../database/models/product.model';
import  sequelize  from '../config/database';
import { AppError } from '../http/middlewares/error.middleware';

export class FavoriteRepository implements FavoriteRepositoryInterface {
    async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ favorites: FavoriteResponseDto[], total: number }> {
        const offset = (page - 1) * limit;

        const { rows, count } = await Favorite.findAndCountAll({
            where: { userId },
            include: [Product],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const favorites = rows.map(favorite => this.formatFavoriteResponse(favorite));

        return {
            favorites,
            total: count
        };
    }

    async checkIfFavorite(userId: string, productId: string): Promise<boolean> {
        const favorite = await Favorite.findOne({
            where: {
                userId,
                productId
            }
        });

        return !!favorite;
    }

    async addToFavorites(userId: string, productId: string): Promise<FavoriteResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si le produit existe
            const product = await Product.findByPk(productId, { transaction });

            if (!product) {
                await transaction.rollback();
                throw new AppError('Product not found', 404);
            }

            // Vérifier si le produit est déjà dans les favoris
            const existingFavorite = await Favorite.findOne({
                where: {
                    userId,
                    productId
                },
                transaction
            });

            if (existingFavorite) {
                await transaction.rollback();
                throw new AppError('Product already in favorites', 400);
            }

            // Ajouter aux favoris
            const favorite = await Favorite.create({
                userId,
                productId
            }, { transaction });

            await transaction.commit();

            // Récupérer le favori avec le produit
            const favoriteWithProduct = await Favorite.findByPk(favorite.id, {
                include: [Product]
            });

            return this.formatFavoriteResponse(favoriteWithProduct);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async removeFromFavorites(userId: string, productId: string): Promise<boolean> {
        const result = await Favorite.destroy({
            where: {
                userId,
                productId
            }
        });

        return result > 0;
    }

    private formatFavoriteResponse(favorite: any): FavoriteResponseDto {
        return {
            id: favorite.id,
            userId: favorite.userId,
            productId: favorite.productId,
            product: favorite.product ? {
                id: favorite.product.id,
                name: favorite.product.name,
                price: parseFloat(favorite.product.price.toString()),
                image: favorite.product.image,
                stock: favorite.product.stock,
                isActive: favorite.product.isActive
            } : undefined,
            createdAt: favorite.createdAt,
            updatedAt: favorite.updatedAt
        };
    }
}
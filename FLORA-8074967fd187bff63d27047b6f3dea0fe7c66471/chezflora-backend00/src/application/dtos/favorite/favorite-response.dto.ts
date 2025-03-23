// src/application/dtos/favorite/favorite-response.dto.ts
export interface FavoriteResponseDto {
    id: string;
    userId: string;
    productId: string;
    product?: {
        id: string;
        name: string;
        price: number;
        image?: string;
        stock: number;
        isActive: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
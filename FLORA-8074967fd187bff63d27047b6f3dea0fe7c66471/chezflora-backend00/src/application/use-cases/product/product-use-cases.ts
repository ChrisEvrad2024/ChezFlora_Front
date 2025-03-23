// src/application/use-cases/product/product-use-cases.ts
import { ProductRepository } from '../../../domain/repositories/product-repository.interface';
import { ProductEntity } from '../../../domain/entities/product.entity';

interface GetProductsInput {
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}

interface GetProductsOutput {
    success: boolean;
    message: string;
    products?: ProductEntity[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class GetProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(input: GetProductsInput): Promise<GetProductsOutput> {
        try {
            const page = input.page || 1;
            const limit = input.limit || 10;
            const offset = (page - 1) * limit;

            const { products, total } = await this.productRepository.findAll({
                categoryId: input.categoryId,
                isActive: input.isActive !== undefined ? input.isActive : true,
                limit,
                offset,
                search: input.search
            });

            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                message: 'Products retrieved successfully',
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to retrieve products: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

interface GetProductDetailInput {
    id: string;
}

interface GetProductDetailOutput {
    success: boolean;
    message: string;
    product?: ProductEntity;
}

export class GetProductDetailUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(input: GetProductDetailInput): Promise<GetProductDetailOutput> {
        try {
            const product = await this.productRepository.findById(input.id);

            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            return {
                success: true,
                message: 'Product retrieved successfully',
                product
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to retrieve product: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
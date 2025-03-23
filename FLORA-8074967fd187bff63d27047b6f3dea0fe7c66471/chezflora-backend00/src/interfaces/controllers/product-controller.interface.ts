// src/interfaces/controllers/product.controller.ts
import { Request, Response } from 'express';
import { GetProductsUseCase, GetProductDetailUseCase } from '../../application/use-cases/product/product-use-cases';
import { ProductRepository } from '../../domain/repositories/product-repository.interface';


export class ProductController {
    constructor(private readonly productRepository: ProductRepository) { }

    async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId, search } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Execute use case
            const getProductsUseCase = new GetProductsUseCase(this.productRepository);
            const result = await getProductsUseCase.execute({
                categoryId: categoryId as string,
                isActive: true,
                page,
                limit,
                search: search as string
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async getProductDetail(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Execute use case
            const getProductDetailUseCase = new GetProductDetailUseCase(this.productRepository);
            const result = await getProductDetailUseCase.execute({ id });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
}
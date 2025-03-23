// src/infrastructure/http/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../../application/services/product/product.service';
import { ProductFilterDto } from '../../../application/dtos/product/product-filter.dto';
import { CreateProductDto } from '../../../application/dtos/product/create-product.dto';
import { UpdateProductDto } from '../../../application/dtos/product/update-product.dto';
import { AppError } from '../middlewares/error.middleware';

export class ProductController {
    constructor(private productService: ProductService) { }

    getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filters: ProductFilterDto = {
                categoryId: req.query.categoryId as string,
                search: req.query.search as string,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                isActive: req.query.isActive === 'true' ? true : (req.query.isActive === 'false' ? false : undefined),
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sortBy: req.query.sortBy as string,
                sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC'
            };

            const result = await this.productService.getAllProducts(filters);

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: result.products,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const product = await this.productService.getProductById(id);

            res.status(200).json({
                success: true,
                message: 'Product retrieved successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };

    createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const productData: CreateProductDto = req.body;
            const product = await this.productService.createProduct(productData);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };

    updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const productData: UpdateProductDto = req.body;
            const product = await this.productService.updateProduct(id, productData);

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };

    deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.productService.deleteProduct(id);

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateProductStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            if (typeof quantity !== 'number') {
                throw new AppError('Quantity must be a number', 400);
            }

            const product = await this.productService.updateProductStock(id, quantity);

            res.status(200).json({
                success: true,
                message: 'Product stock updated successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };

    addProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Si vous utilisez multer pour l'upload d'image, vous pouvez accéder au fichier via req.file
            // Sinon, vous devez implémenter la logique d'upload ici

            // Pour cet exemple, nous supposons que l'URL de l'image est passée dans le corps de la requête
            const { imageUrl, order } = req.body;

            if (!imageUrl) {
                throw new AppError('Image URL is required', 400);
            }

            const product = await this.productService.addProductImage(id, imageUrl, order);

            res.status(200).json({
                success: true,
                message: 'Product image added successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };

    removeProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id, imageId } = req.params;

            const product = await this.productService.removeProductImage(id, imageId);

            res.status(200).json({
                success: true,
                message: 'Product image removed successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };

    reorderProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { imageOrders } = req.body;

            if (!Array.isArray(imageOrders)) {
                throw new AppError('Image orders must be an array', 400);
            }

            const product = await this.productService.reorderProductImages(id, imageOrders);

            res.status(200).json({
                success: true,
                message: 'Product images reordered successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    };
}
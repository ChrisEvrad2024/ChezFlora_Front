// src/application/services/product/product.service.ts
import { ProductRepositoryInterface } from '../../../interfaces/repositories/product-repository.interface';
import { CategoryRepositoryInterface } from '../../../interfaces/repositories/category-repository.interface';
import { CreateProductDto } from '../../dtos/product/create-product.dto';
import { UpdateProductDto } from '../../dtos/product/update-product.dto';
import { ProductResponseDto } from '../../dtos/product/product-response.dto';
import { ProductFilterDto } from '../../dtos/product/product-filter.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class ProductService {
    constructor(
        private productRepository: ProductRepositoryInterface,
        private categoryRepository: CategoryRepositoryInterface
    ) {}

    async getAllProducts(filters: ProductFilterDto): Promise<{ products: ProductResponseDto[], pagination: any }> {
        // Vérifier si la catégorie existe si categoryId est spécifié
        if (filters.categoryId) {
            const category = await this.categoryRepository.findById(filters.categoryId);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;

        const { products, total } = await this.productRepository.findAll({
            categoryId: filters.categoryId,
            search: filters.search,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            isActive: filters.isActive,
            limit,
            offset,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
        });

        const totalPages = Math.ceil(total / limit);

        return {
            products: products.map(product => this.mapToProductResponseDto(product)),
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getProductById(id: string): Promise<ProductResponseDto> {
        const product = await this.productRepository.findById(id);
        
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        return this.mapToProductResponseDto(product);
    }

    async createProduct(productData: CreateProductDto): Promise<ProductResponseDto> {
        // Vérifier si la catégorie existe
        const category = await this.categoryRepository.findById(productData.categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        
        // Créer le produit
        const product = await this.productRepository.create({
            ...productData,
            isActive: productData.isActive !== undefined ? productData.isActive : true
        });
        
        return this.mapToProductResponseDto(product);
    }

    async updateProduct(id: string, productData: UpdateProductDto): Promise<ProductResponseDto> {
        // Vérifier si le produit existe
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Vérifier si la nouvelle catégorie existe si elle est spécifiée
        if (productData.categoryId) {
            const category = await this.categoryRepository.findById(productData.categoryId);
            if (!category) {
                throw new AppError('Category not found', 404);
            }
        }
        
        // Mettre à jour le produit
        const updatedProduct = await this.productRepository.update(id, productData);
        
        if (!updatedProduct) {
            throw new AppError('Failed to update product', 500);
        }
        
        return this.mapToProductResponseDto(updatedProduct);
    }

    async deleteProduct(id: string): Promise<boolean> {
        // Vérifier si le produit existe
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Supprimer le produit
        const result = await this.productRepository.delete(id);
        
        if (!result) {
            throw new AppError('Failed to delete product', 500);
        }
        
        return true;
    }

    async updateProductStock(id: string, quantity: number): Promise<ProductResponseDto> {
        // Vérifier si le produit existe
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Mettre à jour le stock
        const updatedProduct = await this.productRepository.updateStock(id, quantity);
        
        if (!updatedProduct) {
            throw new AppError('Failed to update product stock', 500);
        }
        
        return this.mapToProductResponseDto(updatedProduct);
    }

    async addProductImage(productId: string, imageUrl: string, order?: number): Promise<ProductResponseDto> {
        // Vérifier si le produit existe
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Ajouter l'image
        await this.productRepository.addImage(productId, imageUrl, order);
        
        // Récupérer le produit mis à jour
        const updatedProduct = await this.productRepository.findById(productId);
        
        if (!updatedProduct) {
            throw new AppError('Failed to retrieve updated product', 500);
        }
        
        return this.mapToProductResponseDto(updatedProduct);
    }

    async removeProductImage(productId: string, imageId: string): Promise<ProductResponseDto> {
        // Vérifier si le produit existe
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Vérifier si l'image appartient au produit
        const imageExists = product.images?.some(image => image.id === imageId);
        if (!imageExists) {
            throw new AppError('Image not found for this product', 404);
        }
        
        // Supprimer l'image
        const result = await this.productRepository.removeImage(imageId);
        
        if (!result) {
            throw new AppError('Failed to remove image', 500);
        }
        
        // Récupérer le produit mis à jour
        const updatedProduct = await this.productRepository.findById(productId);
        
        if (!updatedProduct) {
            throw new AppError('Failed to retrieve updated product', 500);
        }
        
        return this.mapToProductResponseDto(updatedProduct);
    }

    async reorderProductImages(productId: string, imageOrders: { id: string; order: number }[]): Promise<ProductResponseDto> {
        // Vérifier si le produit existe
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Vérifier si toutes les images appartiennent au produit
        if (product.images) {
            const productImageIds = product.images.map(image => image.id);
            const allImagesExist = imageOrders.every(item => productImageIds.includes(item.id));
            
            if (!allImagesExist) {
                throw new AppError('One or more images do not belong to this product', 400);
            }
        }
        
        // Réorganiser les images
        await this.productRepository.reorderImages(productId, imageOrders);
        
        // Récupérer le produit mis à jour
        const updatedProduct = await this.productRepository.findById(productId);
        
        if (!updatedProduct) {
            throw new AppError('Failed to retrieve updated product', 500);
        }
        
        return this.mapToProductResponseDto(updatedProduct);
    }

    private mapToProductResponseDto(product: any): ProductResponseDto {
        return {
            id: product.id,
            categoryId: product.categoryId,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            category: product.category ? {
                id: product.category.id,
                name: product.category.name
            } : undefined,
            images: product.images ? product.images.map((image: any) => ({
                id: image.id,
                url: image.url,
                order: image.order
            })) : []
        };
    }
}
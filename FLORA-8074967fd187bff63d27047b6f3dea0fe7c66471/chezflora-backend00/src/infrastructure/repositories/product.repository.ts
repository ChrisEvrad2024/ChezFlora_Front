// src/infrastructure/repositories/product.repository.ts
import { Op } from 'sequelize';
import { ProductRepositoryInterface } from '../../interfaces/repositories/product-repository.interface';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductImageEntity } from '../../domain/entities/productImage.entity';
import Product from '../database/models/product.model';
import ProductImage from '../database/models/product-image.model';
import Category from '../database/models/category.model';

export class ProductRepository implements ProductRepositoryInterface {
    async findAll(options?: {
        categoryId?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        isActive?: boolean;
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }): Promise<{ products: ProductEntity[]; total: number }> {
        const whereClause: any = {};
        
        // Filtres
        if (options?.categoryId) {
            whereClause.categoryId = options.categoryId;
        }
        
        if (options?.search) {
            whereClause.name = { [Op.like]: `%${options.search}%` };
        }
        
        if (options?.isActive !== undefined) {
            whereClause.isActive = options.isActive;
        }
        
        if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
            whereClause.price = {};
            
            if (options?.minPrice !== undefined) {
                whereClause.price[Op.gte] = options.minPrice;
            }
            
            if (options?.maxPrice !== undefined) {
                whereClause.price[Op.lte] = options.maxPrice;
            }
        }
        
        // Tri
        const order: any[] = [];
        if (options?.sortBy) {
            order.push([options.sortBy, options.sortOrder || 'ASC']);
        } else {
            order.push(['createdAt', 'DESC']);
        }
        
        const { rows, count } = await Product.findAndCountAll({
            where: whereClause,
            limit: options?.limit,
            offset: options?.offset,
            include: [
                { model: ProductImage },
                { model: Category }
            ],
            order
        });
        
        return {
            products: rows.map(product => product.toJSON() as ProductEntity),
            total: count
        };
    }
    
    async findById(id: string): Promise<ProductEntity | null> {
        const product = await Product.findByPk(id, {
            include: [
                { model: ProductImage },
                { model: Category }
            ]
        });
        
        return product ? product.toJSON() as ProductEntity : null;
    }
    
    async create(productData: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity> {
        const product = await Product.create(productData);
        return product.toJSON() as ProductEntity;
    }
    
    async update(id: string, productData: Partial<ProductEntity>): Promise<ProductEntity | null> {
        const product = await Product.findByPk(id);
        
        if (!product) {
            return null;
        }
        
        await product.update(productData);
        
        // Recharger le produit avec les relations
        const updatedProduct = await Product.findByPk(id, {
            include: [
                { model: ProductImage },
                { model: Category }
            ]
        });
        
        return updatedProduct ? updatedProduct.toJSON() as ProductEntity : null;
    }
    
    async delete(id: string): Promise<boolean> {
        const result = await Product.destroy({ where: { id } });
        return result > 0;
    }
    
    async updateStock(id: string, quantity: number): Promise<ProductEntity | null> {
        const product = await Product.findByPk(id);
        
        if (!product) {
            return null;
        }
        
        product.stock = Math.max(0, product.stock + quantity);
        await product.save();
        
        return product.toJSON() as ProductEntity;
    }
    
    async addImage(productId: string, imageUrl: string, order?: number): Promise<ProductImageEntity> {
        // Vérifier si le produit existe
        const product = await Product.findByPk(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Trouver l'ordre maximum actuel
        let maxOrder = 0;
        if (!order) {
            const lastImage = await ProductImage.findOne({
                where: { productId },
                order: [['order', 'DESC']]
            });
            
            if (lastImage) {
                maxOrder = lastImage.order + 1;
            }
        }
        
        // Créer l'image
        const productImage = await ProductImage.create({
            productId,
            url: imageUrl,
            order: order || maxOrder
        });
        
        return productImage.toJSON() as ProductImageEntity;
    }
    
    async removeImage(imageId: string): Promise<boolean> {
        const result = await ProductImage.destroy({ where: { id: imageId } });
        return result > 0;
    }
    
    async reorderImages(productId: string, imageOrders: { id: string; order: number }[]): Promise<boolean> {
        // Vérifier si le produit existe
        const product = await Product.findByPk(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Mettre à jour l'ordre des images
        for (const item of imageOrders) {
            await ProductImage.update(
                { order: item.order },
                { where: { id: item.id, productId } }
            );
        }
        
        return true;
    }
}
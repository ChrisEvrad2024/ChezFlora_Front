// src/infrastructure/repositories/category.repository.ts
import { CategoryRepositoryInterface } from '../../interfaces/repositories/category-repository.interface';
import { CategoryEntity } from '../../domain/entities/category.entity';
import Category from '../database/models/category.model';
import Product from '../database/models/product.model';

export class CategoryRepository implements CategoryRepositoryInterface {
    async findAll(options?: {
        parentId?: string | null;
        includeProducts?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{ categories: CategoryEntity[]; total: number }> {
        const whereClause: any = {};
        
        // Filter by parent
        if (options?.parentId !== undefined) {
            whereClause.parentId = options.parentId;
        }
        
        // Build includes based on options
        const includes: any[] = [
            {
                model: Category,
                as: 'childCategories',
            }
        ];
        
        if (options?.includeProducts) {
            includes.push({
                model: Product,
                where: { isActive: true },
                required: false
            });
        }
        
        const { rows, count } = await Category.findAndCountAll({
            where: whereClause,
            include: includes,
            limit: options?.limit,
            offset: options?.offset,
            order: [['name', 'ASC']]
        });
        
        return {
            categories: rows.map(category => category.toJSON() as CategoryEntity),
            total: count
        };
    }
    
    async findById(id: string, includeProducts: boolean = false): Promise<CategoryEntity | null> {
        const includes: any[] = [
            {
                model: Category,
                as: 'childCategories',
            },
            {
                model: Category,
                as: 'parentCategory',
            }
        ];
        
        if (includeProducts) {
            includes.push({
                model: Product,
                where: { isActive: true },
                required: false
            });
        }
        
        const category = await Category.findByPk(id, {
            include: includes
        });
        
        return category ? category.toJSON() as CategoryEntity : null;
    }

    
    
    async create(categoryData: Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryEntity> {
        // Vérifier si la catégorie parent existe si parentId est spécifié
        if (categoryData.parentId) {
            const parentCategory = await Category.findByPk(categoryData.parentId);
            if (!parentCategory) {
                throw new Error('Parent category not found');
            }
        }
        
        const category = await Category.create(categoryData);
        return category.toJSON() as CategoryEntity;
    }
    
    async update(id: string, categoryData: Partial<CategoryEntity>): Promise<CategoryEntity | null> {
        const category = await Category.findByPk(id);
        
        if (!category) {
            return null;
        }
        
        // Vérifier si la catégorie parent existe si parentId est spécifié
        if (categoryData.parentId) {
            const parentCategory = await Category.findByPk(categoryData.parentId);
            if (!parentCategory) {
                throw new Error('Parent category not found');
            }
            
            // Éviter les cycles dans la hiérarchie
            if (categoryData.parentId === id) {
                throw new Error('A category cannot be its own parent');
            }
        }
        
        await category.update(categoryData);
        
        // Recharger la catégorie avec les relations
        const updatedCategory = await Category.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'childCategories',
                },
                {
                    model: Category,
                    as: 'parentCategory',
                }
            ]
        });
        
        return updatedCategory ? updatedCategory.toJSON() as CategoryEntity : null;
    }
    
    async delete(id: string): Promise<boolean> {
        // Vérifier si la catégorie a des produits
        const products = await Product.findOne({ where: { categoryId: id } });
        if (products) {
            throw new Error('Cannot delete category with associated products');
        }
        
        // Vérifier si la catégorie a des sous-catégories
        const childCategories = await Category.findOne({ where: { parentId: id } });
        if (childCategories) {
            throw new Error('Cannot delete category with child categories');
        }
        
        const result = await Category.destroy({ where: { id } });
        return result > 0;
    }
    
    async getHierarchy(): Promise<CategoryEntity[]> {
        // Récupérer toutes les catégories racines (sans parent)
        const rootCategories = await Category.findAll({
            where: { parentId: null },
            include: [
                {
                    model: Category,
                    as: 'childCategories',
                    include: [
                        {
                            model: Category,
                            as: 'childCategories'
                        }
                    ]
                }
            ],
            order: [['name', 'ASC']]
        });
        
        return rootCategories.map(category => category.toJSON() as CategoryEntity);
    }
}
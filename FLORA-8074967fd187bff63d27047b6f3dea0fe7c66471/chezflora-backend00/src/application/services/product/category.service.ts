// src/application/services/product/category.service.ts
import { CategoryRepositoryInterface } from '../../../interfaces/repositories/category-repository.interface';
import { CreateCategoryDto } from '../../dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../../dtos/category/update-category.dto';
import { CategoryResponseDto } from '../../dtos/category/category-response.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class CategoryService {
    constructor(private categoryRepository: CategoryRepositoryInterface) { }

    async getAllCategories(options?: {
        parentId?: string | null;
        includeProducts?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{ categories: CategoryResponseDto[], pagination: any }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        const { categories, total } = await this.categoryRepository.findAll({
            parentId: options?.parentId,
            includeProducts: options?.includeProducts,
            limit,
            offset
        });

        const totalPages = Math.ceil(total / limit);

        return {
            categories: categories.map(category => this.mapToCategoryResponseDto(category)),
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getCategoryById(id: string, includeProducts: boolean = false): Promise<CategoryResponseDto> {
        const category = await this.categoryRepository.findById(id, includeProducts);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        return this.mapToCategoryResponseDto(category);
    }

    async createCategory(categoryData: CreateCategoryDto): Promise<CategoryResponseDto> {
        // Vérifier si la catégorie parent existe si parentId est spécifié
        if (categoryData.parentId) {
            const parentCategory = await this.categoryRepository.findById(categoryData.parentId);
            if (!parentCategory) {
                throw new AppError('Parent category not found', 404);
            }
        }

        // Créer la catégorie
        try {
            const category = await this.categoryRepository.create(categoryData);
            return this.mapToCategoryResponseDto(category);
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(error.message, 400);
            }
            throw error;
        }
    }

    async updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<CategoryResponseDto> {
        // Vérifier si la catégorie existe
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Mettre à jour la catégorie
        try {
            const updatedCategory = await this.categoryRepository.update(id, categoryData);

            if (!updatedCategory) {
                throw new AppError('Failed to update category', 500);
            }

            return this.mapToCategoryResponseDto(updatedCategory);
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(error.message, 400);
            }
            throw error;
        }
    }

    async deleteCategory(id: string): Promise<boolean> {
        // Vérifier si la catégorie existe
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Supprimer la catégorie
        try {
            const result = await this.categoryRepository.delete(id);

            if (!result) {
                throw new AppError('Failed to delete category', 500);
            }

            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(error.message, 400);
            }
            throw error;
        }
    }

    async getCategoryHierarchy(): Promise<CategoryResponseDto[]> {
        const hierarchy = await this.categoryRepository.getHierarchy();
        return hierarchy.map(category => this.mapToCategoryResponseDto(category));
    }

    private mapToCategoryResponseDto(category: any): CategoryResponseDto {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            image: category.image,
            parentId: category.parentId,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            parentCategory: category.parentCategory ? {
                id: category.parentCategory.id,
                name: category.parentCategory.name
            } : undefined,
            childCategories: category.childCategories
                ? category.childCategories.map((child: any) => this.mapToCategoryResponseDto(child))
                : [],
            products: category.products
                ? category.products.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    isActive: product.isActive
                }))
                : undefined
        };
    }
}
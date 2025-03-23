// src/interfaces/repositories/category-repository.interface.ts
import { CreateCategoryDto } from '../../application/dtos/category/create-category.dto';
import { CategoryEntity } from '../../domain/entities/category.entity';

export interface CategoryRepositoryInterface {
    create(category: CreateCategoryDto): Promise<CategoryEntity>;
    findAll(options?: {
        parentId?: string | null;
        includeProducts?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{ categories: CategoryEntity[]; total: number }>;
    
    findById(id: string, includeProducts?: boolean): Promise<CategoryEntity | null>;
    
    create(category: Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryEntity>;
    
    update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity | null>;
    
    delete(id: string): Promise<boolean>;
    
    getHierarchy(): Promise<CategoryEntity[]>;
}
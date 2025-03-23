// src/infrastructure/http/controllers/category.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../../../application/services/product/category.service';
import { CreateCategoryDto } from '../../../application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../../../application/dtos/category/update-category.dto';

export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const options = {
                parentId: req.query.parentId !== undefined 
                    ? (req.query.parentId === 'null' ? null : req.query.parentId as string) 
                    : undefined,
                includeProducts: req.query.includeProducts === 'true',
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10
            };

            const result = await this.categoryService.getAllCategories(options);

            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: result.categories,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const includeProducts = req.query.includeProducts === 'true';
            
            const category = await this.categoryService.getCategoryById(id, includeProducts);

            res.status(200).json({
                success: true,
                message: 'Category retrieved successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryData: CreateCategoryDto = req.body;
            const category = await this.categoryService.createCategory(categoryData);

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const categoryData: UpdateCategoryDto = req.body;
            const category = await this.categoryService.updateCategory(id, categoryData);

            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.categoryService.deleteCategory(id);

            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getCategoryHierarchy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const hierarchy = await this.categoryService.getCategoryHierarchy();

            res.status(200).json({
                success: true,
                message: 'Category hierarchy retrieved successfully',
                data: hierarchy
            });
        } catch (error) {
            next(error);
        }
    };
}
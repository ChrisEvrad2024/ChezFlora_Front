// src/infrastructure/http/routes/category.routes.ts
import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../../../application/services/product/category.service';
import { CategoryRepository } from '../../repositories/category.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import * as validators from '../../../application/validations/category.validation';

const router = Router();

// Initialisation des dépendances
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

// Routes publiques (accessibles sans authentification)
router.get('/', categoryController.getCategories);
router.get('/hierarchy', categoryController.getCategoryHierarchy);
router.get('/:id', categoryController.getCategoryById);

// Routes protégées (nécessitent authentification + rôle admin)
router.post('/',
    authenticate,
    authorize(['admin', 'super_admin']),
    uploadSingleImage('image'),
    validateBody(validators.createCategorySchema),
    categoryController.createCategory
);

router.put('/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    uploadSingleImage('image'),
    validateBody(validators.updateCategorySchema),
    categoryController.updateCategory
);

router.delete('/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    categoryController.deleteCategory
);

export default router;
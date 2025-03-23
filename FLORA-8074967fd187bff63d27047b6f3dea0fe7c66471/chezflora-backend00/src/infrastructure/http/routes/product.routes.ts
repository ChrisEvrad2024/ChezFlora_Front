// src/infrastructure/http/routes/product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../../../application/services/product/product.service';
import { ProductRepository } from '../../repositories/product.repository';
import { CategoryRepository } from '../../repositories/category.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/upload.middleware';
import * as validators from '../../../application/validations/product.validation';

const router = Router();

// Initialisation des dépendances
const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const productService = new ProductService(productRepository, categoryRepository);
const productController = new ProductController(productService);

// Routes publiques (accessibles sans authentification)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Routes protégées (nécessitent authentification + rôle admin)
router.post('/',
    authenticate,
    authorize(['admin', 'super_admin']),
    validateBody(validators.createProductSchema),
    productController.createProduct
);

router.put('/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    validateBody(validators.updateProductSchema),
    productController.updateProduct
);

router.delete('/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    productController.deleteProduct
);

router.patch('/:id/stock',
    authenticate,
    authorize(['admin', 'super_admin']),
    validateBody(validators.updateProductStockSchema),
    productController.updateProductStock
);

// Routes pour la gestion des images
router.post('/:id/images',
    authenticate,
    authorize(['admin', 'super_admin']),
    uploadSingleImage('image'),
    productController.addProductImage
);

router.post('/:id/images/multiple',
    authenticate,
    authorize(['admin', 'super_admin']),
    uploadMultipleImages('images', 5),
    (req, res, next) => {
        // Si les images ont été téléchargées avec succès, ajoutez-les une par une
        if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
            req.body.imageUrl = req.body.imageUrls[0]; // Utiliser la première image
            productController.addProductImage(req, res, next);
        } else {
            next(new Error('No images uploaded'));
        }
    }
);

router.delete('/:id/images/:imageId',
    authenticate,
    authorize(['admin', 'super_admin']),
    productController.removeProductImage
);

router.put('/:id/images/reorder',
    authenticate,
    authorize(['admin', 'super_admin']),
    validateBody(validators.reorderProductImagesSchema),
    productController.reorderProductImages
);

export default router;
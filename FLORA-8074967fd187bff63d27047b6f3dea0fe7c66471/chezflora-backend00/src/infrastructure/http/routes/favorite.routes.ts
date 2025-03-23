// src/infrastructure/http/routes/favorite.routes.ts
import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite.controller';
import { FavoriteService } from '../../../application/services/user/favorite.service';
import { FavoriteRepository } from '../../repositories/favorite.repository';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/favorite.validator';

const router = Router();

// Initialisation des dépendances
const favoriteRepository = new FavoriteRepository();
const favoriteService = new FavoriteService(favoriteRepository);
const favoriteController = new FavoriteController(favoriteService);

// Routes protégées par authentification
router.use(authenticate);

// Routes pour les favoris
router.get('/', favoriteController.getUserFavorites);
router.get('/:productId', favoriteController.checkIfFavorite);
router.post('/', validateBody(validators.addToFavoritesSchema), favoriteController.addToFavorites);
router.delete('/:productId', favoriteController.removeFromFavorites);

export default router;
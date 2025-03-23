// src/infrastructure/http/routes/quote.routes.ts
import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';
import { QuoteService } from '../../../application/services/quote/quote.service';
import { QuoteRepository } from '../../repositories/quote.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/quote.validator';

const router = Router();

// Initialisation des dépendances
const quoteRepository = new QuoteRepository();
const quoteService = new QuoteService(quoteRepository);
const quoteController = new QuoteController(quoteService);

// Routes protégées par authentification
router.use(authenticate);

// Routes pour les utilisateurs standard
router.get('/me', quoteController.getUserQuotes);
router.get('/:id', quoteController.getQuoteById);
router.post('/', validateBody(validators.createQuoteSchema), quoteController.createQuote);
router.post('/:id/respond', validateBody(validators.respondToQuoteSchema), quoteController.respondToQuote);

// Routes réservées aux administrateurs
router.get('/', authorize(['admin']), quoteController.getAllQuotes);
router.put('/:id', authorize(['admin']), validateBody(validators.updateQuoteSchema), quoteController.updateQuote);
router.post('/:id/items', authorize(['admin']), validateBody(validators.quoteItemSchema), quoteController.addQuoteItem);
router.delete('/:id/items/:itemId', authorize(['admin']), quoteController.removeQuoteItem);

export default router;
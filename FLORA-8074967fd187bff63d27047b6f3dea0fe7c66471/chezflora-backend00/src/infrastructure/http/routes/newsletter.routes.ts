// src/infrastructure/http/routes/newsletter.routes.ts
import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';
import { NewsletterService } from '../../../application/services/promotion/newsletter.service';
import { NewsletterRepository } from '../../repositories/newsletter.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/newsletter.validator';

const router = Router();

// Initialisation des dépendances
const newsletterRepository = new NewsletterRepository();
const newsletterService = new NewsletterService(newsletterRepository);
const newsletterController = new NewsletterController(newsletterService);

// Routes publiques
router.post('/subscribe', validateBody(validators.subscribeToNewsletterSchema), newsletterController.subscribe);
router.get('/confirm/:token', newsletterController.confirmSubscription);
router.post('/unsubscribe', validateBody(validators.unsubscribeFromNewsletterSchema), newsletterController.unsubscribe);
router.get('/status/:email', newsletterController.getSubscriptionStatus);

// Routes réservées aux administrateurs
router.get('/', authenticate, authorize(['admin']), newsletterController.getAllSubscribers);

export default router;
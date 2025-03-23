// src/infrastructure/http/routes/invoice.routes.ts
import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceService } from '../../../application/services/payment/invoice.service';
import { InvoiceRepository } from '../../repositories/invoice.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/invoice.validator';

const router = Router();

// Initialisation des dépendances
const invoiceRepository = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepository);
const invoiceController = new InvoiceController(invoiceService);

// Routes protégées par authentification
router.use(authenticate);

// Routes pour tous les utilisateurs authentifiés
router.get('/order/:orderId', invoiceController.getInvoiceByOrderId);
router.get('/:id/pdf', invoiceController.generateInvoicePdf);
router.get('/:id', invoiceController.getInvoiceById);

// Routes réservées aux administrateurs
router.get('/', authorize(['admin']), invoiceController.getAllInvoices);
router.post('/', authorize(['admin']), validateBody(validators.createInvoiceSchema), invoiceController.createInvoice);
router.patch('/:id/status', authorize(['admin']), validateBody(validators.updateInvoiceStatusSchema), invoiceController.updateInvoiceStatus);

export default router;
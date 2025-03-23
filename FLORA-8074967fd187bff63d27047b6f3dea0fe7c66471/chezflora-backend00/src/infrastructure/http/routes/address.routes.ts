// src/infrastructure/http/routes/address.routes.ts
import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { AddressService } from '../../../application/services/user/address.service';
import { AddressRepository } from '../../repositories/address.repository';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/address.validator';

const router = Router();

// Initialisation des dépendances
const addressRepository = new AddressRepository();
const addressService = new AddressService(addressRepository);
const addressController = new AddressController(addressService);

// Routes protégées par authentification
router.use(authenticate);

// Routes pour les adresses
router.get('/', addressController.getUserAddresses);
router.get('/default', addressController.getDefaultAddress);
router.get('/:id', addressController.getAddressById);
router.post('/', validateBody(validators.createAddressSchema), addressController.createAddress);
router.put('/:id', validateBody(validators.updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;
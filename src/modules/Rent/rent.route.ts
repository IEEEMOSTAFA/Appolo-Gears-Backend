import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { RentController } from './rent.controller';
import { RentValidation } from './rent.validation';

const router = express.Router();

// ─── Rent Routes (All require 'user' authentication) ─────────────────────────

router.post(
  '/',
  auth('user'), // User creates a rent request for a car
  validateRequest(RentValidation.createRentValidationSchema),
  RentController.createRent,
);

router.get(
  '/',
  auth('admin', 'user', 'driver'), // Users can see their rents, admin can see all
  RentController.getAllRents,
);

router.get(
  '/:id',
  auth('admin', 'user', 'driver'),
  RentController.getSingleRent,
);

router.patch(
  '/:id',
  auth('admin', 'user'),
  validateRequest(RentValidation.updateRentValidationSchema),
  RentController.updateRent,
);

router.delete(
  '/:id',
  auth('admin', 'user'), // Probably Admin or User who created it can delete
  RentController.deleteRent,
);

export const RentRoutes = router;

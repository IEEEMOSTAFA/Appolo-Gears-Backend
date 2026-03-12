import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { CarController } from './car.controller';
import { CarValidation } from './car.validation';

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', CarController.getAllCars);
router.get('/:id', CarController.getSingleCar);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.post(
  '/',
  auth('admin'),
  validateRequest(CarValidation.createCarValidationSchema),
  CarController.createCar,
);

router.patch(
  '/:id',
  auth('admin'),
  validateRequest(CarValidation.updateCarValidationSchema),
  CarController.updateCar,
);

router.delete(
  '/:id',
  auth('admin'),
  CarController.deleteCar,
);

export const CarRoutes = router;

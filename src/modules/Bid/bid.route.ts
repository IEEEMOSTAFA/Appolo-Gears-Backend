import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { BidController } from './bid.controller';
import { BidValidation } from './bid.validation';

const router = express.Router();

router.post(
  '/',
  auth('driver'), // Only drivers can place bids
  validateRequest(BidValidation.createBidValidationSchema),
  BidController.createBid,
);

router.get(
  '/',
  auth('user', 'admin', 'driver'), // Users, drivers, admins can view
  BidController.getAllBids,
);

router.get(
  '/:id',
  auth('user', 'admin', 'driver'),
  BidController.getSingleBid,
);

router.patch(
  '/:id',
  auth('user', 'admin'), // Users who created rent, or admin, accept bids
  validateRequest(BidValidation.updateBidValidationSchema),
  BidController.updateBid,
);

router.delete(
  '/:id',
  auth('driver', 'admin'), // Only the driver who placed it, or an admin, can delete it
  BidController.deleteBid,
);

export const BidRoutes = router;

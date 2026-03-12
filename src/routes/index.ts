import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { CarRoutes } from '../modules/Car/car.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { RentRoutes } from '../modules/Rent/rent.route';
import { BidRoutes } from '../modules/Bid/bid.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';

const router = Router();

// ─── All Routes ───────────────────────────────────────────────────────────────
const routes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/cars',
    route: CarRoutes,
  },
  {
    path: '/rents',
    route: RentRoutes,
  },
  {
    path: '/bids',
    route: BidRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
];

routes.forEach(({ path, route }) => router.use(path, route));

export default router;
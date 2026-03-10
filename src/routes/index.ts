import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { CarRoutes } from '../modules/Car/car.route';
import { AuthRoutes } from '../modules/Auth/auth.route';

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
];

routes.forEach(({ path, route }) => router.use(path, route));

export default router;
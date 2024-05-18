import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { TenantService } from '../services/TenantService';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import tenantValidator from '../validators/tenant-validator';
import logger from '../config/logger';
import authenticateUser from '../middlewares/authenticateUser';
import { isAuthorized } from '../middlewares/isAuthorized';
import { Roles } from '../constants';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

// Create a new tenant
router.post(
    '/',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next) as unknown as RequestHandler,
);

// Update a tenant
router.patch(
    '/:id',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
);

// Get all tenants
router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next) as unknown as RequestHandler,
);

// Get a tenant by id
router.get(
    '/:id',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getOne(req, res, next) as unknown as RequestHandler,
);

// Delete a tenant
router.delete(
    '/:id',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.delete(req, res, next) as unknown as RequestHandler,
);

export default router;

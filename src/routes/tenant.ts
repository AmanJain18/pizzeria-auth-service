import express, { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
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
    authenticateUser,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

// Update a tenant
router.patch(
    '/:id',
    authenticateUser,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next),
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
    tenantController.getTenantList(req, res, next),
);

export default router;

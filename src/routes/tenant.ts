import express, { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

// Create a new tenant
router.post('/', (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
);

export default router;

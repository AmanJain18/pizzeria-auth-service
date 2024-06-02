import { Response, NextFunction, Request } from 'express';
import { Logger } from 'winston';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, address } = req.body;
        this.logger.debug('New request to create a tenant', req.body);
        try {
            const tenant = await this.tenantService.createTenant({
                name,
                address,
            });
            this.logger.info('New tenant has been created', { id: tenant.id });

            res.status(201).json({ tenantId: tenant.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url parameter'));
            return;
        }
        this.logger.debug('Request to update a tenant', req.body);

        try {
            await this.tenantService.updateTenant(Number(tenantId), {
                name,
                address,
            });

            this.logger.info('Tenant has been updated', { id: tenantId });

            res.status(200).json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getTenants();
            this.logger.info('All tenants have been fetched');
            res.status(200).json(tenants);
        } catch (err) {
            next(err);
            return;
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            return next(createHttpError(400, 'Invalid url parameter'));
        }

        try {
            const tenant = await this.tenantService.getTenantById(
                Number(tenantId),
            );

            if (!tenant) {
                return next(createHttpError(400, 'Tenant not found'));
            }

            this.logger.info('Tenant have been fetched');
            res.status(200).json(tenant);
        } catch (err) {
            next(err);
            return;
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            return next(createHttpError(400, 'Invalid url parameter'));
        }

        try {
            await this.tenantService.deleteTenant(Number(tenantId));
            this.logger.info('Tenant has been deleted', { id: tenantId });
            res.status(200).json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
            return;
        }
    }
}

import { Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        // Log the request
        this.logger.debug('New request to create a tenant', {
            name,
            address,
        });
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
}

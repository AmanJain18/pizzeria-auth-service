import { ITenant } from './../types/index';
import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import createHttpError from 'http-errors';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async createTenant({ name, address }: ITenant) {
        try {
            return await this.tenantRepository.save({
                name,
                address,
            });
        } catch (err) {
            const error = createHttpError(500, 'Error saving tenant data');
            throw error;
        }
    }
}

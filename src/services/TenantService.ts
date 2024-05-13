import { ITenant } from './../types/index';
import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import createHttpError from 'http-errors';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async createTenant(tenantData: ITenant) {
        try {
            return await this.tenantRepository.save(tenantData);
        } catch (err) {
            const error = createHttpError(500, 'Error saving tenant data');
            throw error;
        }
    }

    async updateTenant(id: number, tenantData: ITenant) {
        return await this.tenantRepository.update(id, tenantData);
    }

    async getTenants() {
        return await this.tenantRepository.find();
    }

    async getTenantById(tenantId: number) {
        return await this.tenantRepository.findOne({ where: { id: tenantId } });
    }
}

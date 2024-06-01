import { ITenant } from './../types/index';
import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import createHttpError from 'http-errors';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    // Create a new tenant
    async createTenant(tenantData: ITenant) {
        try {
            return await this.tenantRepository.save(tenantData);
        } catch (err) {
            const error = createHttpError(500, 'Error saving tenant data');
            throw error;
        }
    }

    // Update tenant data
    async updateTenant(id: number, tenantData: ITenant) {
        try {
            return await this.tenantRepository.update(id, tenantData);
        } catch (err) {
            const error = createHttpError(500, 'Error updating tenant data');
            throw error;
        }
    }

    // Get all tenants
    async getTenants() {
        try {
            return await this.tenantRepository.find();
        } catch (err) {
            const error = createHttpError(500, 'Error retrieving tenants');
            throw error;
        }
    }

    // Get a tenant by id
    async getTenantById(tenantId: number) {
        try {
            const tenant = await this.tenantRepository.findOne({
                where: { id: tenantId },
            });
            if (!tenant) {
                throw createHttpError(404, 'Tenant not found');
            }
            return tenant;
        } catch (err) {
            const error = createHttpError(500, 'Error retrieving tenant');
            throw error;
        }
    }

    // Delete a tenant by id
    async deleteTenant(tenantId: number) {
        try {
            const result = await this.tenantRepository.delete(tenantId);
            if (result.affected === 0) {
                throw createHttpError(404, 'Tenant not found');
            }
            return result;
        } catch (err) {
            const error = createHttpError(500, 'Error deleting tenant');
            throw error;
        }
    }
}

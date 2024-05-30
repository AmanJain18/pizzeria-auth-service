import request from 'supertest';
import app from '../../src/app';
import { Tenant } from './../../src/entity/Tenant';
import { Roles } from '../../src/constants';
import { jwks, connection } from '../utils/testSetup';

describe('POST /tenants', () => {
    describe('Tenant created', () => {
        it('should return status code 201', async () => {
            // Arrange
            const adminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.ADMIN,
            });

            const tentantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tentantData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should create a new tenant in the database', async () => {
            // Arrange
            const adminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.ADMIN,
            });

            const tentantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            // Act
            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tentantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tentantData.name);
            expect(tenants[0].address).toBe(tentantData.address);
        });

        it('should return status code 401 if user is not authenticated', async () => {
            // Arrange
            const tentantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            // Act
            const response = await request(app)
                .post('/tenants')
                .send(tentantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(response.statusCode).toBe(401);
            expect(tenants).toHaveLength(0);
        });

        it('should return status code 403 if user is not admin', async () => {
            // Arrange
            const notAdminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.CUSTOMER,
            });

            const tentantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${notAdminToken}`])
                .send(tentantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(response.statusCode).toBe(403);
            expect(tenants).toHaveLength(0);
        });
    });
});

import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Tenant } from './../../src/entity/Tenant';
import { Roles } from '../../src/constants';

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:3000');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
        jwks.stop();
    });

    describe('Tenant Created', () => {
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
    });
});

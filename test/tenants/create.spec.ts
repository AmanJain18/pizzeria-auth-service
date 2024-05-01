import { Tenant } from './../../src/entity/Tenant';
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';

describe('POST /tenants', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Tenant Created', () => {
        it('should return status code 201', async () => {
            // Arrange
            const tentantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            // Act
            const response = await request(app)
                .post('/tenants')
                .send(tentantData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should create a new tenant in the database', async () => {
            // Arrange
            const tentantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            // Act
            await request(app).post('/tenants').send(tentantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tentantData.name);
            expect(tenants[0].address).toBe(tentantData.address);
        });
    });
});

import request from 'supertest';
import app from '../../src/app';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';
import { Tenant } from '../../src/entity/Tenant';
import { connection, jwks } from '../utils/testSetup';

describe('POST /users', () => {
    describe('User created by admin', () => {
        it('should return status code 201', async () => {
            // Create tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: 'Test tenant',
                address: 'Test address',
            });
            // Arrange
            const adminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
                tenantId: tenant.id,
                role: Roles.Manager,
            };

            // Act
            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should persist a new user in the database', async () => {
            // Create tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: 'Test tenant',
                address: 'Test address',
            });
            // Arrange
            const adminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
                tenantId: tenant.id,
                role: Roles.Manager,
            };

            // Act
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create user of role manager', async () => {
            // Create tenant
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: 'Test tenant',
                address: 'Test address',
            });
            // Arrange
            const adminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.ADMIN,
            });

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
                tenantId: tenant.id,
                role: Roles.Manager,
            };

            // Act
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.Manager);
        });

        it('should return status code 401 if user is not authenticated', async () => {
            // Create tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: 'Test tenant',
                address: 'Test address',
            });
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
                tenantId: tenant.id,
                role: Roles.Manager,
            };

            // Act
            const response = await request(app).post('/users').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(401);
            expect(users).toHaveLength(0);
        });

        it('should return status code 403 if user is not admin', async () => {
            // Create tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: 'Test tenant',
                address: 'Test address',
            });
            // Arrange
            const notAdminToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.CUSTOMER,
            });

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
                tenantId: tenant.id,
                role: Roles.Manager,
            };

            // Act
            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${notAdminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(403);
            expect(users).toHaveLength(0);
        });
    });
});

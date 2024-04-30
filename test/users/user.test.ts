import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
// import bcrypt from 'bcryptjs';
// import { extractTokenFromCookie, isValidJwt } from '../utils';

describe('GET /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:3002');
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

    describe('Check if user is logged in', () => {
        it('should return status code 200', async () => {
            // Arrange
            const accessToken = jwks.token({
                iss: 'auth-service',
                sub: '1',
                role: Roles.CUSTOMER,
            });
            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return the user data', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const userRepository = AppDataSource.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                iss: 'auth-service',
                sub: String(data.id),
                role: data.role,
            });

            // Act
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            // Assert
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it('should not return the password field', async () => {
            // Register user
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            // Generate token
            const accessToken = jwks.token({
                iss: 'auth-service',
                sub: String(data.id),
                role: data.role,
            });

            // Add token to cookie
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();
            // Assert
            // Check if user id matches with registered user
            expect(response.body as Record<string, string>).not.toHaveProperty(
                'password',
            );
        });
    });
});

import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { connection, jwks } from '../utils/testSetup';

describe('GET /auth/self', () => {
    describe('Check if user is already logged in', () => {
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

        it('should return status code 401 if token does not exists', async () => {
            // Arrange
            // Register user
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            //Act
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Send request without token
            const response = await request(app).get('/auth/self').send();
            // Assert
            expect(response.statusCode).toBe(401);
        });
    });
});

import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
// import bcrypt from 'bcryptjs';
// import { User } from '../../src/entity/User';
// import { extractTokenFromCookie, isValidJwt } from '../utils';

describe('POST /auth/login', () => {
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

    describe('Successful Login', () => {
        it('should return status code 200', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            await request(app).post('/auth/register').send(userData);
            // Arrange
            const loginData = {
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/login')
                .send(loginData);
            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return valid json response', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            await request(app).post('/auth/register').send(userData);
            // Arrange
            const loginData = {
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/login')
                .send(loginData);
            // Assert
            // Application/json utf-8
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });
    });
});

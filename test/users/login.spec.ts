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

    describe('Login with Missing Fields', () => {
        it('should return status code 400 if email is missing', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            await request(app).post('/auth/register').send(userData);
            // Arrange
            const loginData = {
                email: '',
                password: 'Test@1234',
            };
            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send(loginData);
            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe('Email is required');
        });
        it('should return status code 400 if password is missing', async () => {
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
                password: '',
            };
            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send(loginData);
            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe('Password is required');
        });
    });

    describe('Invalid Credentials', () => {
        it('should return status code 400 if email format is invalid', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            await request(app).post('/auth/register').send(userData);
            // Arrange
            const loginData = {
                email: 'testgmail.com', // Invalid email format
                password: 'Test@1234',
            };
            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send(loginData);
            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].msg).toBe('Invalid email');
        });

        it('should throw status code 400 and error message for invalid email', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            await request(app).post('/auth/register').send(userData);

            const loginData = {
                email: 'Test1@Gmail.com', // Different email
                password: 'Test@1234',
            };
            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send(loginData);
            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].msg).toBe(
                'Invalid Email or password',
            );
        });

        it('should throw status code 400 and error message for invalid password', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            await request(app).post('/auth/register').send(userData);
            // Arrange
            const loginData = {
                email: ' test@gmail.com ',
                password: 'Test@123456',
            };
            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send(loginData);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].msg).toBe(
                'Invalid Email or password',
            );
        });
    });
});

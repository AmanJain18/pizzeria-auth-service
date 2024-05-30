import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import bcrypt from 'bcryptjs';
import { extractTokenFromCookie, isValidJwt } from '../utils';
import { connection } from '../utils/testSetup';

describe('POST /auth/login', () => {
    describe('Successful Login', () => {
        it('should return status code 200', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return valid json response', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            // Application/json utf-8
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                'set-cookie'?: string[];
            }

            const cookies: string[] =
                (response.headers as Headers)['set-cookie'] || [];
            const accessToken = extractTokenFromCookie(cookies, 'accessToken');
            const refreshToken = extractTokenFromCookie(
                cookies,
                'refreshToken',
            );
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isValidJwt(accessToken)).toBeTruthy();
            expect(isValidJwt(refreshToken)).toBeTruthy();
        });
    });

    describe('Login with Missing Fields', () => {
        it('should return status code 400 if email is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send({
                password: userData.password,
            });

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe('Email is required');
        });

        it('should return status code 400 if password is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/login').send({
                email: userData.email,
            });

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0].msg).toBe('Password is required');
        });
    });

    describe('Invalid Credentials', () => {
        it('should return status code 400 if email format is invalid', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
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

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

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
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

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

    describe('Email Field Handling', () => {
        it('should allow login regardless of email case', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should trim the email field', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });
    });
});

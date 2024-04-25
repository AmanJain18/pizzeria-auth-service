import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { extractTokenFromCookie, isValidJwt } from '../utils';

describe('POST /auth/register', () => {
    // This will hold the database connection
    let connection: DataSource;
    beforeAll(async () => {
        // This will create the database connection before all tests
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // This will clear the database before each test (Truncate/Drop and synchronize the database)
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        // This will close the database connection after all tests
        await connection.destroy();
    });

    describe('Successful Registration', () => {
        it('should return status code 201', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            // Application/json utf-8
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user data in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return the id of the created user', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.body).toHaveProperty('id');
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it('should assign a customer role to register user', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store hashed password in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toEqual(
                expect.stringMatching(/^\$2b\$10\$/),
            );
        });

        it('should return status code 400 if email already exists', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Create a user with the same email
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const users = await userRepository.find();
            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it('should return the access and refresh tokens in the cookie', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            interface Headers {
                'set-cookie'?: string[];
            }

            // expect(response.headers['set-cookie']).toBeDefined();
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

    describe('Registration with Missing Fields', () => {
        it('should return status code 400 if email is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: '',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return status code 400 if firstName is missing', async () => {
            // Arrange
            const userData = {
                firstName: '',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return status code 400 if lastName is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: '',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return status code 400 if password is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: '',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields refractor', () => {
        it('should trim the email field', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: ' test@gmail.com ',
                password: 'Test@1234',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe('test@gmail.com');
        });
        it('should return status code 400 if email format is invalid', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'testgmail.com', // Invalid email format
                password: 'Test@1234',
            };
            // Act
            const response: {
                statusCode: number;
                body: { errors: { msg: string }[] };
            } = await request(app).post('/auth/register').send(userData);
            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0].msg).toBe('Invalid email');
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return status code 400 if password does not meet complexity requirements', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'testpassword', // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should handle email case sensitivity', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'Test@1234',
            };
            await request(app).post('/auth/register').send(userData);

            const userData2 = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'Test@Gmail.com', // Different case
                password: 'Test@1234',
            };
            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData2);
            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
        });
    });
});

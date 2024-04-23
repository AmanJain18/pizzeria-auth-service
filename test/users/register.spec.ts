import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils/index';

describe('POST /auth/register', () => {
    // This will hold the database connection
    let connection: DataSource;
    beforeAll(async () => {
        // This will create the database connection before all tests
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // This will clear the database before each test (Truncate the database)
        await truncateTables(connection);
    });

    afterAll(async () => {
        // This will close the database connection after all tests
        await connection.destroy();
    });

    describe('given all fields', () => {
        it('should return status code 201', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@gmail.com',
                password: 'password',
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
                password: 'password',
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
                password: 'password',
            };
            // Act
            await request(app).post('/auth/register').send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
        });
    });
});

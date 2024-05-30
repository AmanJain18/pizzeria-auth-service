import { DataSource, QueryRunner } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Config } from '../../src/config';
import createJWKSMock from 'mock-jwks';

// This will hold the database connection
export let connection: DataSource;

// This will hold the jwks mock server
export let jwks: ReturnType<typeof createJWKSMock>;

// This will create the database connection before all tests
beforeAll(async () => {
    jwks = createJWKSMock(Config.JWKS_MOCK_HOST!);
    connection = await AppDataSource.initialize();
});

// This will clear the database before each test (Truncate/Drop and synchronize the database)
beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
});

// This will close the jwks server after each test
afterEach(() => {
    jwks.stop();
});

// This will close the database connection after all tests
afterAll(async () => {
    await connection.destroy();
    jwks.stop();
});

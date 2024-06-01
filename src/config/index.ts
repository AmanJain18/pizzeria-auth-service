import { config } from 'dotenv';
import path from 'path';

config({
    path: path.join(
        __dirname,
        `../../.env.${process.env.NODE_ENV || 'development'}`,
    ),
});

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    CORS_ORIGIN,
    JWKS_URI,
    JWKS_MOCK_HOST,
    PRIVATE_KEY,
    SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD,
    BCRYPT_SALT_ROUNDS,
} = process.env;

if (!DB_USERNAME || !DB_PASSWORD || !DB_NAME || !REFRESH_TOKEN_SECRET) {
    throw new Error('Missing critical environment variables.');
}

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    CORS_ORIGIN,
    JWKS_URI,
    JWKS_MOCK_HOST,
    PRIVATE_KEY,
    SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD,
    BCRYPT_SALT_ROUNDS: Number(BCRYPT_SALT_ROUNDS),
};

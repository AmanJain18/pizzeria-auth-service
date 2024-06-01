import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

    // Create an access token
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, 'Private key not found');
            throw error;
        }

        try {
            privateKey = Buffer.from(Config.PRIVATE_KEY, 'base64').toString(
                'utf-8',
            );
        } catch (err) {
            const error = createHttpError(500, 'Error reading private key');
            throw error;
        }
        try {
            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256', // RSA SHA-256 hash algorithm
                expiresIn: '1h', // 1 hour
                issuer: 'auth-service', // Issuer
            });
            return accessToken;
        } catch (err) {
            const error = createHttpError(500, 'Error generating access token');
            throw error;
        }
    }

    // Create a refresh token
    generateRefreshToken(payload: JwtPayload) {
        try {
            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
                algorithm: 'HS256', // HMAC SHA-256 hash algorithm
                expiresIn: '30d', // 30 days
                issuer: 'auth-service', // Issuer
                jwtid: String(payload.id), // User ID
            });
            return refreshToken;
        } catch (err) {
            const error = createHttpError(
                500,
                'Error generating refresh token',
            );
            throw error;
        }
    }

    // Persist the refresh token
    async persistRefreshToken(user: User) {
        try {
            const newRefreshToken = await this.refreshTokenRepository.save({
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
                user: user,
            });
            return newRefreshToken;
        } catch (err) {
            const error = createHttpError(
                500,
                'Error persisting refresh token',
            );
            throw error;
        }
    }

    // Delete a refresh token by id
    async deleteRefreshToken(id: number) {
        try {
            return await this.refreshTokenRepository.delete(id);
        } catch (err) {
            const error = createHttpError(500, 'Error deleting refresh token');
            throw error;
        }
    }
}

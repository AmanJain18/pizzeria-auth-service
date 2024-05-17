import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    // Create an access token
    generateAccessToken(paylod: JwtPayload) {
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, 'Private key not found');
            throw error;
        }

        try {
            privateKey = Config.PRIVATE_KEY;
        } catch (err) {
            const error = createHttpError(500, 'Error reading private key');
            throw error;
        }
        const accessToken = sign(paylod, privateKey, {
            algorithm: 'RS256', // RSA SHA-256 hash algorithm
            expiresIn: '1h', // 1 hour
            issuer: 'auth-service', // Issuer
        });

        return accessToken;
    }
    // Create a refresh token
    generateRefreshToken(paylod: JwtPayload) {
        const refreshToken = sign(paylod, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256', // HMAC SHA-256 hash algorithm
            expiresIn: '30d', // 30 days
            issuer: 'auth-service', // Issuer
            jwtid: String(paylod.id), // User ID
        });

        return refreshToken;
    }
    // Persist the refresh token
    async persistRefreshToken(user: User) {
        const newRefreshToken = await this.refreshTokenRepository.save({
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
            user: user,
        });

        return newRefreshToken;
    }

    async deleteRefreshToken(id: number) {
        return await this.refreshTokenRepository.delete(id);
    }
}

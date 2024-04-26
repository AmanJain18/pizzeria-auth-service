import fs from 'fs';
import path from 'path';
import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';

export class TokenService {
    // Create an access token
    generateAccessToken(paylod: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, '../../certs/privateKey.pem'),
            );
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
}

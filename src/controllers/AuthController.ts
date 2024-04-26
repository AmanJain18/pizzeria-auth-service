import createHttpError from 'http-errors';
import fs from 'fs';
import path from 'path';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Logger } from 'winston';
import { Config } from '../config';

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validate the request
        const result = validationResult(req);
        // If there are errors, return them
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
            });
            return;
        }
        const { firstName, lastName, email, password } = req.body;
        // Log the request
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '******',
        });
        try {
            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User has been registered', { id: user.id });
            let privateKey: Buffer;

            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/privateKey.pem'),
                );
            } catch (err) {
                this.logger.error('Error reading private key', err);
                const error = createHttpError(500, 'Error reading private key');
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256', // RSASSA-PKCS1-v1_5 using SHA-256 hash algorithm
                expiresIn: '1h', // 1 hour
                issuer: 'auth-service',
            });

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256', // HMAC using SHA-256 hash algorithm
                expiresIn: '30d', // 30 days
                issuer: 'auth-service',
            });

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}

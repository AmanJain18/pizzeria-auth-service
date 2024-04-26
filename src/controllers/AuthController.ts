import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepository.save({
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
                user: user,
            });

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
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

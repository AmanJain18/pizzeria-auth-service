import { CredentialService } from './../services/CredentialService';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest, LoginUserRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { firstName, lastName, email, password } = req.body;
        // Log the request
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
        });
        try {
            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });
            this.logger.info('User has been registered', { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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

    async login(req: LoginUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { email, password } = req.body;
        // Log the request
        this.logger.debug('New request to login a user', {
            email,
        });

        try {
            const user = await this.userService.userExist(email);
            if (
                !user ||
                !(await this.credentialService.comparePassword(
                    password,
                    user.password,
                ))
            ) {
                return next(createHttpError(400, 'Invalid Email or password'));
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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

            this.logger.info('User has been logged in', { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        // If the user is logged in, return the user's information by checking the token
        const user = await this.userService.findById(Number(req.auth.sub));
        res.status(200).json(user);
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        // If the user is logged in, return the user's information by checking the token
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                return next(
                    createHttpError(
                        400,
                        'User associated with the token could not be found',
                    ),
                );
            }

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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

            this.logger.info('New Access and Refresh Token assign', {
                id: user.id,
            });
            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info('Refresh token has been deleted', {
                id: req.auth.id,
            });
            this.logger.info('User has been logged out', { id: req.auth.sub });

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).json({});
        } catch (err) {
            next(err);
            return;
        }
    }
}

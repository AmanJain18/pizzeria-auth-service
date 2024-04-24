import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import createHttpError from 'http-errors';

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
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
            });
            return;
        }
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '******',
        });

        if (!email || !password || !firstName || !lastName) {
            const error = createHttpError(400, 'Missing required fields');
            next(error);
            return;
        }
        try {
            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}

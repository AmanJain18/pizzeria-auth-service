import { Response, NextFunction, Request } from 'express';
import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import {
    CreateUserRequest,
    IUserQueryParams,
    UpdateUserRequest,
} from '../types';
import createHttpError from 'http-errors';
import { matchedData, validationResult } from 'express-validator';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        // Validate the request
        const result = validationResult(req);
        // If there are errors, return them
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
            });
            return;
        }
        const { firstName, lastName, email, password, tenantId, role } =
            req.body;
        // Log the request
        this.logger.debug('New request to create a tenant', req.body);
        try {
            const user = await this.userService.registerUser({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });
            this.logger.info('New user has been created', { id: user.id });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        // Validate the request
        const result = validationResult(req);
        // If there are errors, return them
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
            });
            return;
        }
        const { email, firstName, lastName, role, tenantId } = req.body;
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url parameter'));
            return;
        }
        // Log the request
        this.logger.debug('Request to update the user', req.body);
        try {
            await this.userService.updateEmployeeUser(Number(userId), {
                email,
                firstName,
                lastName,
                role,
                tenantId,
            });
            this.logger.info('User has been updated', { id: userId });

            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [users, totalCount] = await this.userService.getUsers(
                validatedQuery as IUserQueryParams,
            );
            this.logger.info('All users have been fetched');
            res.json({
                data: users,
                currentPage: validatedQuery.currentPage as number,
                pageSize: validatedQuery.pageSize as number,
                totalCount,
            });
        } catch (err) {
            next(err);
            return;
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url parameter'));
            return;
        }

        try {
            const user = await this.userService.findById(Number(userId));

            if (!user) {
                next(createHttpError(400, 'User not found'));
                return;
            }

            this.logger.info('User have been fetched', { id: user.id });
            res.json(user);
        } catch (err) {
            next(err);
            return;
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url parameter'));
            return;
        }

        try {
            await this.userService.deleteUser(Number(userId));
            this.logger.info('Tenant has been deleted', { id: userId });
            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
            return;
        }
    }
}

import { Response, NextFunction, Request } from 'express';
import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';
import createHttpError from 'http-errors';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
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

    async update(req: CreateUserRequest, res: Response, next: NextFunction) {
        const userId = req.params.id;
        const { email, firstName, lastName, role, tenantId } = req.body;
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
        try {
            const users = await this.userService.getUsers();
            this.logger.info('All users have been fetched');
            res.json(users);
        } catch (err) {
            next(err);
            return;
        }
    }
}

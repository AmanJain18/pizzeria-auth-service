import { Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';

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
}

import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types';
import createHttpError from 'http-errors';

export const isAuthorized = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest;
            const roleFromToken = _req.auth.role;

            if (!roles.includes(roleFromToken)) {
                throw createHttpError(
                    403,
                    'Unauthorized, you do not have enough permission.',
                );
            }
            next();
        } catch (err) {
            next(err);
        }
    };
};

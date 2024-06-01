import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from '../config/logger';
import { v4 as uuid } from 'uuid';

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    // Handle the error here
    const errorId = uuid();
    const statusCode = err.statusCode || err.status || 500;

    const inProduction = process.env.NODE_ENV === 'production';
    const message = inProduction
        ? {
              404: 'The requested resource was not found.',
              500: 'An unexpected error occurred. Please try again later.',
          }[statusCode] || 'An error occurred.'
        : err.message;

    logger.error(err.message, {
        id: errorId,
        name: err.name,
        code: statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                method: req.method,
                location: 'auth-server',
                stack: inProduction ? null : err.stack,
            },
        ],
    });
};

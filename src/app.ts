import express, { Request, Response, NextFunction } from 'express';
import logger from './config/logger';
import createError, { HttpError } from 'http-errors';

const app = express();

app.get('/', (req, res) => {
    const error = createError(401, 'Unauthorized');
    throw error;
    res.send('Welcome to auth service');
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    // Handle the error here
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.message,
                path: '',
                location: '',
            },
        ],
    });
});
export default app;

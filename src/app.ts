import express, { Request, Response, NextFunction } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Define a route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to auth service');
});

// Use the 'authRouter' for requests starting with '/auth'
app.use('/auth', authRouter);

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    // Handle the error here
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;

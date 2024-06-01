import express from 'express';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';
import userRouter from './routes/user';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app = express();

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
);

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

// Use the 'tenantRouter' for requests starting with '/tenants'
app.use('/tenants', tenantRouter);

// Use the 'userRouter' for requests starting with '/users'
app.use('/users', userRouter);

// Error handling middleware
app.use(globalErrorHandler);

export default app;

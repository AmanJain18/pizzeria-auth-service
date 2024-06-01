import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from '.';

export const configSetup = (app: express.Application) => {
    app.use(
        cors({
            origin: Config.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        }),
    );

    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
};

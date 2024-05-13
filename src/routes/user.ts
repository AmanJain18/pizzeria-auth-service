import express, { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { UserController } from '../controllers/UserController';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import authenticateUser from '../middlewares/authenticateUser';
import { isAuthorized } from '../middlewares/isAuthorized';
import { Roles } from '../constants';
import { User } from '../entity/User';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

// Create a new user by admin
router.post(
    '/',
    authenticateUser,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

export default router;

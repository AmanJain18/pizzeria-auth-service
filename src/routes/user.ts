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

// Update a user by admin - Manager and other support roles (Employees)
router.patch(
    '/:id',
    authenticateUser,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
);

// Get all users
router.get(
    '/',
    authenticateUser,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);

// Get a user by id
router.get(
    '/:id',
    authenticateUser,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next),
);

export default router;

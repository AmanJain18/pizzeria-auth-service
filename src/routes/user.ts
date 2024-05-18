import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { UserService } from '../services/UserService';
import { UserController } from '../controllers/UserController';
import { AppDataSource } from '../config/data-source';
import { isAuthorized } from '../middlewares/isAuthorized';
import { Roles } from '../constants';
import { User } from '../entity/User';
import { CreateUserRequest, UpdateUserRequest } from '../types';
import createUserValidator from '../validators/create-user-validator';
import updateUserValidator from '../validators/update-user-validator';
import authenticateUser from '../middlewares/authenticateUser';
import logger from '../config/logger';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

// Create a new user by admin
router.post(
    '/',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    createUserValidator,
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next) as unknown as RequestHandler,
);

// Update a user by admin - Manager and other support roles (Employees)
router.patch(
    '/:id',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next) as unknown as RequestHandler,
);

// Get all users
router.get(
    '/',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next) as unknown as RequestHandler,
);

// Get a user by id
router.get(
    '/:id',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next) as unknown as RequestHandler,
);

// Delete a user
router.delete(
    '/:id',
    authenticateUser as RequestHandler,
    isAuthorized([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.delete(req, res, next) as unknown as RequestHandler,
);

export default router;

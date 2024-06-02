import { Brackets, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../entity/User';
import { IUpdateUserByAdmin, IUserQueryParams, UserData } from '../types';
import createHttpError from 'http-errors';
import { Config } from '../config';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    // Register a new user
    async registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        // Check if the user already exists
        const userExist = await this.userRepository.findOne({
            where: { email: email },
        });
        if (userExist) {
            const error = createHttpError(400, 'User already exists');
            throw error;
        }

        const saltRounds = Config.BCRYPT_SALT_ROUNDS || 10; // Number of salt rounds for hashing the password
        const hashPassword = await bcrypt.hash(password, saltRounds); // Hash the password

        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashPassword,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            const error = createHttpError(500, 'Error saving user data');
            throw error;
        }
    }

    // Check if the user exists by email
    async userExist(email: string) {
        try {
            return await this.userRepository.findOne({
                where: { email: email },
                select: [
                    'id',
                    'firstName',
                    'lastName',
                    'email',
                    'password',
                    'role',
                ],
            });
        } catch (err) {
            throw createHttpError(500, 'Error checking if user exists');
        }
    }

    // Find a user by id
    async findById(id: number) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: id },
                relations: {
                    tenant: true,
                },
            });
            if (!user) {
                throw createHttpError(404, 'User not found');
            }
            return user;
        } catch (err) {
            throw createHttpError(500, 'Error retrieving user');
        }
    }

    // Update employee data by admin
    async updateEmployeeUser(
        userId: number,
        { firstName, lastName, role, email, tenantId }: IUpdateUserByAdmin,
    ) {
        // Check if the user exists
        const userExist = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!userExist) {
            const error = createHttpError(404, 'User not found');
            throw error;
        }

        try {
            await this.userRepository.update(userId, {
                firstName,
                lastName,
                email,
                role,
                tenant: tenantId ? { id: tenantId } : null,
            });
        } catch (err) {
            const error = createHttpError(500, 'Error updating user data');
            throw error;
        }
    }

    // Get all users with query parameters
    async getUsers(validatedQuery: IUserQueryParams) {
        const { currentPage, pageSize } = validatedQuery;
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (validatedQuery.q) {
            const searchedTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchedTerm },
                    )
                        .orWhere('user.email ILike :q', { q: searchedTerm })
                        .orWhere('tenant.name ILike :q', { q: searchedTerm });
                }),
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            });
        }

        try {
            const users = await queryBuilder
                .select([
                    'user.id',
                    'user.firstName',
                    'user.lastName',
                    'user.email',
                    'user.role',
                    'user.createdAt',
                ])
                .leftJoinAndSelect('user.tenant', 'tenant')
                .skip((currentPage - 1) * pageSize)
                .take(pageSize)
                .orderBy('user.id', 'DESC')
                .getManyAndCount();
            return users;
        } catch (err) {
            throw createHttpError(500, 'Error retrieving users');
        }
    }

    // Delete a user by id
    async deleteUser(userId: number) {
        try {
            const result = await this.userRepository.delete(userId);
            if (result.affected === 0) {
                throw createHttpError(404, 'User not found');
            }
            return result;
        } catch (err) {
            throw createHttpError(500, 'Error deleting user');
        }
    }
}

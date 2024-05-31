import { Brackets, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../entity/User';
import { IUpdateUserByAdmin, IUserQueryParams, UserData } from '../types';
import createHttpError from 'http-errors';

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
        // If the user exists, throw an error
        if (userExist) {
            const error = createHttpError(400, 'User already exists');
            throw error;
        }
        // Number of salt rounds
        const saltRounds = 10;
        // Hashing the password
        const hashPassword = await bcrypt.hash(password, saltRounds);
        // Save user data to the database
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
            // If an error occurs while saving, throw an error
            const error = createHttpError(500, 'Error saving user data');
            throw error;
        }
    }

    // Check if the user exists
    async userExist(email: string) {
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
    }

    // Find a user by id
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: { id: id },
            relations: {
                tenant: true,
            },
        });
    }

    // Update user data by admin
    async updateEmployeeUser(
        userId: number,
        { firstName, lastName, role, email, tenantId }: IUpdateUserByAdmin,
    ) {
        // Check if the user exists
        const userExist = await this.userRepository.findOne({
            where: { id: userId },
        });
        // If the user does not exist, throw an error
        if (!userExist) {
            const error = createHttpError(404, 'User not found');
            throw error;
        }

        // Update user data
        try {
            await this.userRepository.update(userId, {
                firstName,
                lastName,
                email,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            // If an error occurs while updating, throw an error
            const error = createHttpError(500, 'Error updating user data');
            throw error;
        }
    }

    // Get all users
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
                    ).orWhere('user.email ILike :q', { q: searchedTerm });
                }),
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            });
        }

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
    }

    // Delete a user by Id
    async deleteUser(userId: number) {
        return await this.userRepository.delete(userId);
    }
}

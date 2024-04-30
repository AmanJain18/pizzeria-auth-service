import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async registerUser({ firstName, lastName, email, password }: UserData) {
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
                role: Roles.CUSTOMER,
            });
        } catch (err) {
            // If an error occurs while saving, throw an error
            const error = createHttpError(500, 'Error saving user data');
            throw error;
        }
    }

    async userExist(email: string) {
        // Check if the user exists
        return await this.userRepository.findOne({
            where: { email: email },
        });
    }

    async findById(id: number) {
        // Find a user by id
        return await this.userRepository.findOne({
            where: { id: id },
        });
    }
}

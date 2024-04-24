import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
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
        if (userExist) {
            const error = createHttpError(400, 'User already exists');
            throw error;
        }
        // Hashing the password
        const saltRounds = 10;
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
            const error = createHttpError(500, 'Error saving user data');
            throw error;
        }
    }
}

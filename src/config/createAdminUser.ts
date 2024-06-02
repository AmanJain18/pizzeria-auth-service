import { User } from '../entity/User';
import { UserData } from '../types';
import { AppDataSource } from './data-source';
import bcrypt from 'bcryptjs';
import logger from './logger';
import { Config } from '.';

export const createAdminUser = async ({
    firstName,
    lastName,
    email,
    password,
    role,
}: UserData) => {
    try {
        const userRepository = AppDataSource.getRepository(User);

        await userRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const existingAdmin = await transactionalEntityManager.findOne(
                    User,
                    {
                        where: { role: 'admin', email },
                    },
                );
                if (!existingAdmin) {
                    const saltRounds = Config.BCRYPT_SALT_ROUNDS || 10;

                    const hashPassword = await bcrypt.hash(
                        password,
                        saltRounds,
                    );
                    await transactionalEntityManager.save(User, {
                        firstName,
                        lastName,
                        email,
                        password: hashPassword,
                        role,
                    });
                    logger.info('Super admin created successfully');
                    return true;
                } else {
                    logger.info('Admin user already exists');
                    return false;
                }
            },
        );
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            throw err;
        }
    }
};

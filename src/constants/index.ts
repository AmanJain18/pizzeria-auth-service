import { Config } from '../config';

export const Roles = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    Manager: 'manager',
    Support: 'support',
} as const;

export const SuperAdmin = {
    firstName: 'Super',
    lastName: 'Admin',
    email: String(Config.SUPER_ADMIN_EMAIL),
    password: String(Config.SUPER_ADMIN_PASSWORD),
    role: Roles.ADMIN,
};

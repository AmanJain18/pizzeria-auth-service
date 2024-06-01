import { Config } from '../config';

export const Roles = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    MANAGER: 'manager',
    SUPPORT: 'support',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const SuperAdmin = {
    firstName: 'Super',
    lastName: 'Admin',
    email: String(Config.SUPER_ADMIN_EMAIL),
    password: String(Config.SUPER_ADMIN_PASSWORD),
    role: Roles.ADMIN,
};

import { checkSchema } from 'express-validator';
import { UpdateUserRequest } from '../types';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required',
        notEmpty: true,
        trim: true,
        isLength: {
            options: { min: 2 },
            errorMessage: 'First name must be at least 2 characters long',
        },
    },
    lastName: {
        errorMessage: 'Last name is required',
        notEmpty: true,
        trim: true,
        isLength: {
            options: { min: 2 },
            errorMessage: 'Last name must be at least 2 characters long',
        },
    },
    email: {
        trim: true,
        errorMessage: 'Email is required',
        toLowerCase: true,
        notEmpty: {
            errorMessage: 'Email is required',
            bail: true,
        },
        isEmail: {
            errorMessage: 'Invalid email',
        },
    },
    password: {
        errorMessage: 'Password is required',
        trim: true,
        notEmpty: {
            errorMessage: 'Password is required',
            bail: true,
        },
        isLength: {
            errorMessage: 'Password must be at least 8 characters long',
            options: { min: 8 },
            bail: true,
        },
        isStrongPassword: {
            errorMessage:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            options: {
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            },
        },
    },
    role: {
        errorMessage: 'Role is required',
        notEmpty: true,
        trim: true,
    },
    tenantId: {
        errorMessage: 'Tenant Id is required',
        trim: true,
        custom: {
            options: (value: string, { req }) => {
                const role = (req as UpdateUserRequest).body.role;
                if (role === 'admin') {
                    return true;
                }
                return !!value;
            },
        },
    },
});

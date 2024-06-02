import { checkSchema } from 'express-validator';
import { UpdateUserRequest } from '../types';
import { Roles } from '../constants';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required!',
        notEmpty: true,
        trim: true,
        isLength: {
            options: { min: 2 },
            errorMessage: 'First name must be at least 2 characters long',
        },
    },
    lastName: {
        errorMessage: 'Last name is required!',
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
                if (role !== Roles.ADMIN) {
                    if (!value) {
                        throw new Error(
                            'Tenant Id is required for non-admin roles',
                        );
                    }
                }
                return true;
            },
        },
    },
});

import { checkSchema } from 'express-validator';
import { UpdateUserRequest } from '../types';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required!',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required!',
        notEmpty: true,
        trim: true,
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
    role: {
        errorMessage: 'Role is required',
        notEmpty: true,
        trim: true,
    },
});

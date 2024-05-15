import { checkSchema } from 'express-validator';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required',
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
});

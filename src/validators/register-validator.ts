import { checkSchema } from 'express-validator';

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
        errorMessage: 'Email is required',
        trim: true,
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
});

// Different ways to export the same thing:
// export default [body("email").notEmpty().withMessage("Email is required!")]

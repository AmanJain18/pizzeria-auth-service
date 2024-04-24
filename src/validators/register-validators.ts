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
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        toLowerCase: true,
        isEmail: {
            errorMessage: 'Invalid email',
        },
    },
    password: {
        errorMessage: 'Password is required',
        notEmpty: true,
        trim: true,
        isLength: {
            errorMessage: 'Password must be at least 8 characters long',
            options: { min: 8 },
        },
    },
});

// Different ways to export the same thing:
// export default [body("email").notEmpty().withMessage("Email is required!")]

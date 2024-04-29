import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: {
            errorMessage: 'Email is required',
            bail: true,
        },
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
    },
});

// Different ways to export the same thing:
// export default [body("email").notEmpty().withMessage("Email is required!")]

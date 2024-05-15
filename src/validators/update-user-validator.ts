import { checkSchema } from 'express-validator';

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
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: 'Role is required',
        notEmpty: true,
        trim: true,
    },
});

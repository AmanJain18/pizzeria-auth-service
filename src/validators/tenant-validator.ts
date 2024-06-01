import { checkSchema } from 'express-validator';

export default checkSchema({
    name: {
        errorMessage: 'Tenant name is required',
        notEmpty: {
            errorMessage: 'Tenant name is required',
            bail: true,
        },
        trim: true,
        isLength: {
            options: { min: 3 },
            errorMessage: 'Tenant name must be at least 3 characters long',
        },
    },
    address: {
        errorMessage: 'Tenant address is required',
        notEmpty: true,
        trim: true,
    },
});

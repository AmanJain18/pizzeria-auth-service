import { checkSchema } from 'express-validator';

export default checkSchema({
    name: {
        errorMessage: 'Tenant name is required',
        notEmpty: {
            errorMessage: 'Tenant name is required',
            bail: true,
        },
        trim: true,
    },
    address: {
        errorMessage: 'Tenant address is required',
        notEmpty: true,
        trim: true,
    },
});

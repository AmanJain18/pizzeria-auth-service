import { checkSchema } from 'express-validator';

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : '';
                },
            },
        },
        role: {
            isString: true,
            customSanitizer: {
                options: (value: string) => {
                    return value ? value : '';
                },
            },
        },
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
            isInt: {
                options: { min: 1 },
                errorMessage: 'Current page must be a positive integer',
            },
        },
        pageSize: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return isNaN(parsedValue) ? 10 : parsedValue;
                },
            },
            isInt: {
                options: { min: 1 },
                errorMessage: 'Page size must be a positive integer',
            },
        },
    },
    ['query'],
);

import express, { Request, Response } from 'express';

const router = express.Router();

// Create a new tenant

router.post('/', (req: Request, res: Response) => {
    res.status(201).json({
        message: 'Tenant created successfully',
    });
});

export default router;

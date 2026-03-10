import { NextFunction, Request, Response } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        error: {
            statusCode: 404,
            name: 'NotFound',
        },
    });
};

export default notFound;

import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const err = new Error('Validation failed');
        (err as any).statusCode = 400;
        (err as any).code = 'VALIDATION_ERROR';
        (err as any).errors = error.issues;
        return next(err);
      }
      next(error);
    }
  };
};
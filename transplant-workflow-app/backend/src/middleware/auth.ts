import { Request, Response, NextFunction } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        permissions?: string[];
        [key: string]: any;
      };
    }
  }
}

// Auth0 JWT validation middleware
export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Require authentication
export const requireAuth = [
  checkJwt,
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
      return next(new AppError('Invalid or missing authentication token', 401));
    }
    next(err);
  },
];

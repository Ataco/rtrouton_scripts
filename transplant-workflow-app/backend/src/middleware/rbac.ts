import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
    role?: any;
  };
}

// Load user from database and attach to request
export const loadUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.sub) {
      return next(new AppError('Authentication required', 401));
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: req.auth.sub },
      include: { role: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.isActive) {
      return next(new AppError('User account is inactive', 403));
    }

    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('Error loading user:', error);
    next(new AppError('Error loading user', 500));
  }
};

// Check if user has required permission
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return next(new AppError('User role not found', 403));
    }

    const permissions = req.user.role.permissions as string[];

    if (!permissions.includes(permission) && !permissions.includes('*')) {
      logger.warn(`Permission denied: ${req.user.email} attempted ${permission}`);
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Check if user has any of the required roles
export const requireRole = (...roleNames: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return next(new AppError('User role not found', 403));
    }

    if (!roleNames.includes(req.user.role.name)) {
      logger.warn(`Role denied: ${req.user.email} attempted to access ${roleNames.join(', ')}`);
      return next(new AppError('Insufficient role', 403));
    }

    next();
  };
};

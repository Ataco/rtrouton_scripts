import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest } from './rbac';
import { logger } from '../utils/logger';

// Audit log creator
export const createAuditLog = async (
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null = null,
  changes: any = null,
  req?: Request
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        changes,
        ipAddress: req?.ip,
        userAgent: req?.get('user-agent'),
      },
    });
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
};

// Middleware to log all requests
export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip health checks and static files
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Capture response data
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (data: any) {
    responseBody = data;
    return originalSend.call(this, data);
  } as any;

  // Log after response
  res.on('finish', () => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id || null;

    // Only log mutations (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const action = req.method === 'DELETE' ? 'DELETE' :
                     req.method === 'POST' ? 'CREATE' : 'UPDATE';

      const resource = req.path.split('/')[2] || 'UNKNOWN'; // Extract resource from path

      createAuditLog(userId, action, resource, null, {
        method: req.method,
        path: req.path,
        body: req.body,
        statusCode: res.statusCode,
      }, req);
    }
  });

  next();
};

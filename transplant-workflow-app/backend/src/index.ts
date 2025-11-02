import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { auditMiddleware } from './middleware/audit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import caseRoutes from './routes/cases';
import organMatchRoutes from './routes/organMatches';
import reportingRoutes from './routes/reporting';
import workflowRoutes from './routes/workflows';
import surgeonNotesRoutes from './routes/surgeonNotes';
import chatRoutes from './routes/chat';
import transportRoutes from './routes/transport';
import preservationRoutes from './routes/preservation';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import donorSummaryRoutes from './routes/donorSummary';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export const prisma = new PrismaClient();
export { io };

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Audit logging middleware
app.use(auditMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/organ-matches', organMatchRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/surgeon-notes', surgeonNotesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/preservation', preservationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/donor-summary', donorSummaryRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-case', (caseId: string) => {
    socket.join(`case-${caseId}`);
    logger.info(`Socket ${socket.id} joined case ${caseId}`);
  });

  socket.on('leave-case', (caseId: string) => {
    socket.leave(`case-${caseId}`);
    logger.info(`Socket ${socket.id} left case ${caseId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

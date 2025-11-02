import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { io } from '../index';
import multer from 'multer';
import path from 'path';

const router = Router();

router.use(requireAuth, loadUser);

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});

// Send message
router.post('/messages', requirePermission('send:messages'), asyncHandler(async (req, res) => {
  const { donorCaseId, content, tags } = req.body;

  const message = await prisma.chatMessage.create({
    data: {
      donorCaseId,
      authorId: req.user!.id,
      content,
      tags,
      messageType: 'USER',
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  // Emit to case room
  io.to(`case-${donorCaseId}`).emit('chat:message', message);

  res.status(201).json({ message });
}));

// Upload file
router.post('/upload', upload.single('file'), requirePermission('upload:files'), asyncHandler(async (req, res) => {
  const { donorCaseId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const message = await prisma.chatMessage.create({
    data: {
      donorCaseId,
      authorId: req.user!.id,
      content: `📎 ${req.file.originalname}`,
      attachments: [{ name: req.file.originalname, url: fileUrl, type: req.file.mimetype }],
      messageType: 'USER',
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  // Emit to case room
  io.to(`case-${donorCaseId}`).emit('chat:message', message);

  res.status(201).json({ message, fileUrl });
}));

// Get messages for case
router.get('/:donorCaseId/messages', requirePermission('view:messages'), asyncHandler(async (req, res) => {
  const { donorCaseId } = req.params;
  const { limit = '50', offset = '0' } = req.query;

  const messages = await prisma.chatMessage.findMany({
    where: { donorCaseId },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
  });

  res.json({ messages: messages.reverse() });
}));

export default router;

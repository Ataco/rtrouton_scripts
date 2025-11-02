import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { NotificationService } from '../services/notificationService';

const router = Router();

router.use(requireAuth, loadUser);

// Send notification to user
router.post(
  '/send',
  requirePermission('admin:notifications'),
  asyncHandler(async (req, res) => {
    const { userId, type, title, message, severity, link, metadata } = req.body;

    await NotificationService.send({
      userId,
      type,
      title,
      message,
      severity,
      link,
      metadata,
    });

    res.json({ success: true, message: 'Notification sent' });
  })
);

// Send batch notifications
router.post(
  '/send-batch',
  requirePermission('admin:notifications'),
  asyncHandler(async (req, res) => {
    const { notifications } = req.body;

    await NotificationService.sendBatch(notifications);

    res.json({ success: true, message: `${notifications.length} notifications sent` });
  })
);

// Get user notifications
router.get(
  '/my-notifications',
  requirePermission('view:notifications'),
  asyncHandler(async (req, res) => {
    // In production, would fetch from a proper notifications table
    res.json({ notifications: [] });
  })
);

export default router;

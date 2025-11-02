import { prisma } from '../index';
import { io } from '../index';
import { logger } from '../utils/logger';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  metadata?: any;
}

// Multi-channel notification service
export class NotificationService {
  // Send notification to user
  static async send(payload: NotificationPayload): Promise<void> {
    try {
      // Create notification record
      const notification = await prisma.systemConfig.create({
        data: {
          key: `notification_${Date.now()}_${payload.userId}`,
          value: payload,
          category: 'NOTIFICATION',
        },
      });

      // Send real-time notification via Socket.IO
      await this.sendSocketNotification(payload);

      // Send email notification if configured
      if (this.shouldSendEmail(payload)) {
        await this.sendEmailNotification(payload);
      }

      // Send SMS if critical
      if (payload.severity === 'error' && this.shouldSendSMS(payload)) {
        await this.sendSMSNotification(payload);
      }

      logger.info(`Notification sent to user ${payload.userId}: ${payload.title}`);
    } catch (error) {
      logger.error('Failed to send notification:', error);
    }
  }

  // Send batch notifications
  static async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload);
    }
  }

  // Send Socket.IO notification
  private static async sendSocketNotification(
    payload: NotificationPayload
  ): Promise<void> {
    io.to(`user-${payload.userId}`).emit('notification', {
      id: Date.now(),
      ...payload,
      timestamp: new Date(),
    });
  }

  // Send email notification
  private static async sendEmailNotification(
    payload: NotificationPayload
  ): Promise<void> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    logger.info(`Email notification (simulated): ${payload.title} to user ${payload.userId}`);

    // Example integration:
    /*
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user) {
      await emailService.send({
        to: user.email,
        subject: payload.title,
        html: this.buildEmailTemplate(payload),
      });
    }
    */
  }

  // Send SMS notification
  private static async sendSMSNotification(
    payload: NotificationPayload
  ): Promise<void> {
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    logger.info(`SMS notification (simulated): ${payload.message} to user ${payload.userId}`);

    // Example integration:
    /*
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user?.phoneNumber) {
      await smsService.send({
        to: user.phoneNumber,
        message: payload.message,
      });
    }
    */
  }

  // Check if email should be sent
  private static shouldSendEmail(payload: NotificationPayload): boolean {
    // Send email for warnings and errors
    return ['warning', 'error'].includes(payload.severity);
  }

  // Check if SMS should be sent
  private static shouldSendSMS(payload: NotificationPayload): boolean {
    // Send SMS only for critical errors
    return payload.severity === 'error' && payload.type.includes('CRITICAL');
  }

  // Build email template
  private static buildEmailTemplate(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${this.getSeverityColor(payload.severity)}; color: white; padding: 20px; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${payload.title}</h2>
          </div>
          <div class="content">
            <p>${payload.message}</p>
            ${payload.link ? `<p><a href="${payload.link}">View Details</a></p>` : ''}
          </div>
          <div class="footer">
            <p>Transplant Workflow Management System</p>
            <p>This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get color for severity
  private static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  }

  // Notify coordinator of new assignment
  static async notifyCoordinatorAssignment(
    coordinatorId: string,
    organMatchId: string,
    organType: string,
    donorId: string
  ): Promise<void> {
    await this.send({
      userId: coordinatorId,
      type: 'COORDINATOR_ASSIGNMENT',
      title: 'New Case Assignment',
      message: `You have been assigned to ${organType} match for donor ${donorId}`,
      severity: 'info',
      link: `/cases/${organMatchId}`,
      metadata: { organMatchId, organType, donorId },
    });
  }

  // Notify team of preservation time warning
  static async notifyPreservationWarning(
    organMatchId: string,
    remainingTime: number,
    organType: string
  ): Promise<void> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: {
        assignedCoordinator: true,
        donorCase: true,
      },
    });

    if (!organMatch) return;

    const message = `${organType} preservation time warning: ${remainingTime} minutes remaining`;

    // Notify coordinator
    if (organMatch.coordinatorId) {
      await this.send({
        userId: organMatch.coordinatorId,
        type: 'PRESERVATION_WARNING',
        title: 'Preservation Time Alert',
        message,
        severity: 'warning',
        link: `/cases/${organMatch.donorCaseId}`,
        metadata: { organMatchId, remainingTime, organType },
      });
    }

    // Notify all users in the case room
    io.to(`case-${organMatch.donorCaseId}`).emit('preservation:warning', {
      organMatchId,
      organType,
      remainingTime,
      severity: 'warning',
    });
  }

  // Notify team of transport ETA change
  static async notifyTransportETAChange(
    organMatchId: string,
    newETA: Date,
    organType: string
  ): Promise<void> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: {
        assignedCoordinator: true,
        donorCase: true,
      },
    });

    if (!organMatch) return;

    const message = `${organType} transport ETA updated: ${newETA.toLocaleString()}`;

    if (organMatch.coordinatorId) {
      await this.send({
        userId: organMatch.coordinatorId,
        type: 'TRANSPORT_ETA_UPDATE',
        title: 'Transport ETA Updated',
        message,
        severity: 'info',
        link: `/cases/${organMatch.donorCaseId}`,
        metadata: { organMatchId, newETA, organType },
      });
    }
  }

  // Notify surgeon of new notes or updates
  static async notifySurgeonUpdate(
    surgeonId: string,
    organMatchId: string,
    updateType: string,
    message: string
  ): Promise<void> {
    await this.send({
      userId: surgeonId,
      type: `SURGEON_${updateType}`,
      title: 'Case Update',
      message,
      severity: 'info',
      link: `/cases/${organMatchId}`,
      metadata: { organMatchId, updateType },
    });
  }

  // Notify admin of system events
  static async notifyAdminEvent(
    event: string,
    message: string,
    severity: 'info' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          name: 'Admin',
        },
      },
    });

    for (const admin of admins) {
      await this.send({
        userId: admin.id,
        type: `ADMIN_${event}`,
        title: 'System Event',
        message,
        severity,
        link: '/admin',
        metadata: { event },
      });
    }
  }

  // Schedule recurring notifications
  static async scheduleRecurringNotifications(): Promise<void> {
    // Check for cases needing attention every hour
    setInterval(async () => {
      await this.checkCasesNeedingAttention();
      await this.checkPreservationTimeWarnings();
      await this.checkMissingReports();
    }, 60 * 60 * 1000); // Every hour

    logger.info('Recurring notifications scheduled');
  }

  // Check cases needing attention
  private static async checkCasesNeedingAttention(): Promise<void> {
    const cases = await prisma.donorCase.findMany({
      where: {
        status: 'ACTIVE',
        organMatches: {
          some: {
            coordinatorId: null,
          },
        },
      },
      include: {
        organMatches: true,
      },
    });

    for (const case_ of cases) {
      const unassignedOrgans = case_.organMatches.filter((m) => !m.coordinatorId);

      if (unassignedOrgans.length > 0) {
        await this.notifyAdminEvent(
          'UNASSIGNED_ORGANS',
          `Case ${case_.donorId} has ${unassignedOrgans.length} unassigned organs`,
          'warning'
        );
      }
    }
  }

  // Check preservation time warnings
  private static async checkPreservationTimeWarnings(): Promise<void> {
    const organMatches = await prisma.organMatch.findMany({
      where: {
        status: { in: ['OFFERED', 'ACCEPTED'] },
      },
      include: {
        preservationSegments: true,
        analytics: true,
      },
    });

    for (const match of organMatches) {
      if (match.analytics) {
        const totalTime =
          (match.analytics.totalColdIschemia || 0) + (match.analytics.totalWarmIschemia || 0);

        // Warn if over 75% of recommended time
        const warningThreshold = 360; // 6 hours
        if (totalTime > warningThreshold * 0.75) {
          await this.notifyPreservationWarning(
            match.id,
            warningThreshold - totalTime,
            match.organType
          );
        }
      }
    }
  }

  // Check missing reports
  private static async checkMissingReports(): Promise<void> {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const organMatches = await prisma.organMatch.findMany({
      where: {
        status: 'ACCEPTED',
        createdAt: { lt: twelveHoursAgo },
      },
      include: {
        reportingRecords: true,
        assignedCoordinator: true,
      },
    });

    for (const match of organMatches) {
      if (match.reportingRecords.length === 0 && match.coordinatorId) {
        await this.send({
          userId: match.coordinatorId,
          type: 'MISSING_REPORT',
          title: 'Report Reminder',
          message: `${match.organType} match ${match.matchId} is missing required reports`,
          severity: 'warning',
          link: `/cases/${match.id}`,
          metadata: { organMatchId: match.id },
        });
      }
    }
  }
}

import { prisma } from '../index';
import { io } from '../index';
import { logger } from '../utils/logger';

// Workflow automation engine
export class WorkflowAutomation {
  // Evaluate workflow conditions
  static async evaluateConditions(
    organMatchId: string,
    conditions: any[]
  ): Promise<boolean> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: {
        donorCase: true,
        analytics: true,
        preservationSegments: true,
        transportRecords: true,
      },
    });

    if (!organMatch) return false;

    for (const condition of conditions) {
      const result = await this.evaluateCondition(organMatch, condition);
      if (!result) return false;
    }

    return true;
  }

  // Evaluate single condition
  private static async evaluateCondition(
    organMatch: any,
    condition: any
  ): Promise<boolean> {
    const { type, field, operator, value } = condition;

    switch (type) {
      case 'time':
        return this.evaluateTimeCondition(organMatch, field, operator, value);
      case 'status':
        return this.evaluateStatusCondition(organMatch, field, operator, value);
      case 'analytics':
        return this.evaluateAnalyticsCondition(organMatch, field, operator, value);
      case 'preservation':
        return this.evaluatePreservationCondition(organMatch, field, operator, value);
      default:
        return false;
    }
  }

  // Time-based conditions
  private static evaluateTimeCondition(
    organMatch: any,
    field: string,
    operator: string,
    value: number
  ): boolean {
    const now = Date.now();
    const created = new Date(organMatch.createdAt).getTime();
    const elapsed = (now - created) / 1000 / 60; // minutes

    switch (operator) {
      case 'gt':
        return elapsed > value;
      case 'lt':
        return elapsed < value;
      case 'eq':
        return Math.abs(elapsed - value) < 5; // within 5 minutes
      default:
        return false;
    }
  }

  // Status-based conditions
  private static evaluateStatusCondition(
    organMatch: any,
    field: string,
    operator: string,
    value: string
  ): boolean {
    const actualValue = organMatch[field];
    switch (operator) {
      case 'eq':
        return actualValue === value;
      case 'neq':
        return actualValue !== value;
      case 'in':
        return Array.isArray(value) && value.includes(actualValue);
      default:
        return false;
    }
  }

  // Analytics-based conditions
  private static evaluateAnalyticsCondition(
    organMatch: any,
    field: string,
    operator: string,
    value: number
  ): boolean {
    if (!organMatch.analytics) return false;
    const actualValue = organMatch.analytics[field];

    switch (operator) {
      case 'gt':
        return actualValue > value;
      case 'lt':
        return actualValue < value;
      case 'eq':
        return actualValue === value;
      case 'gte':
        return actualValue >= value;
      case 'lte':
        return actualValue <= value;
      default:
        return false;
    }
  }

  // Preservation-based conditions
  private static evaluatePreservationCondition(
    organMatch: any,
    field: string,
    operator: string,
    value: number
  ): boolean {
    if (!organMatch.preservationSegments || organMatch.preservationSegments.length === 0) {
      return false;
    }

    // Calculate total preservation time
    let totalTime = 0;
    const phase = field.includes('cold') ? 'COLD' : 'WARM';

    organMatch.preservationSegments.forEach((segment: any) => {
      if (segment.phase === phase) {
        const endTime = segment.endTime || new Date();
        const duration = (endTime.getTime() - new Date(segment.startTime).getTime()) / 1000 / 60;
        totalTime += duration;
      }
    });

    switch (operator) {
      case 'gt':
        return totalTime > value;
      case 'lt':
        return totalTime < value;
      case 'gte':
        return totalTime >= value;
      case 'lte':
        return totalTime <= value;
      default:
        return false;
    }
  }

  // Execute automation actions
  static async executeActions(
    organMatchId: string,
    actions: any[]
  ): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(organMatchId, action);
      } catch (error) {
        logger.error(`Failed to execute action: ${action.type}`, error);
      }
    }
  }

  // Execute single action
  private static async executeAction(
    organMatchId: string,
    action: any
  ): Promise<void> {
    const { type, data } = action;

    switch (type) {
      case 'notify':
        await this.sendNotification(organMatchId, data);
        break;
      case 'update_status':
        await this.updateStatus(organMatchId, data);
        break;
      case 'assign_coordinator':
        await this.assignCoordinator(organMatchId, data);
        break;
      case 'create_task':
        await this.createTask(organMatchId, data);
        break;
      case 'send_alert':
        await this.sendAlert(organMatchId, data);
        break;
      case 'calculate_analytics':
        await this.calculateAnalytics(organMatchId);
        break;
      default:
        logger.warn(`Unknown action type: ${type}`);
    }
  }

  // Action: Send notification
  private static async sendNotification(
    organMatchId: string,
    data: any
  ): Promise<void> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: { donorCase: true },
    });

    if (!organMatch) return;

    // Emit socket notification
    io.to(`case-${organMatch.donorCaseId}`).emit('workflow:notification', {
      organMatchId,
      message: data.message,
      severity: data.severity || 'info',
    });

    // Create chat message
    if (data.toChat) {
      await prisma.chatMessage.create({
        data: {
          donorCaseId: organMatch.donorCaseId,
          authorId: 'system',
          content: `🤖 ${data.message}`,
          messageType: 'AUTO_SUMMARY',
        },
      });
    }
  }

  // Action: Update status
  private static async updateStatus(
    organMatchId: string,
    data: any
  ): Promise<void> {
    await prisma.organMatch.update({
      where: { id: organMatchId },
      data: { status: data.status },
    });
  }

  // Action: Assign coordinator
  private static async assignCoordinator(
    organMatchId: string,
    data: any
  ): Promise<void> {
    await prisma.organMatch.update({
      where: { id: organMatchId },
      data: { coordinatorId: data.coordinatorId },
    });
  }

  // Action: Create task
  private static async createTask(
    organMatchId: string,
    data: any
  ): Promise<void> {
    // Create a task record (would need a Task model)
    logger.info(`Creating task for organ match ${organMatchId}: ${data.title}`);
    // Implementation depends on task system
  }

  // Action: Send alert
  private static async sendAlert(
    organMatchId: string,
    data: any
  ): Promise<void> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: { donorCase: true, assignedCoordinator: true },
    });

    if (!organMatch) return;

    // Emit critical alert
    io.to(`case-${organMatch.donorCaseId}`).emit('workflow:alert', {
      organMatchId,
      severity: 'critical',
      message: data.message,
      actionRequired: data.actionRequired,
    });

    logger.warn(`Alert sent for organ match ${organMatchId}: ${data.message}`);
  }

  // Action: Calculate analytics
  private static async calculateAnalytics(organMatchId: string): Promise<void> {
    // Trigger analytics recalculation
    const { calculateOrganAnalytics } = await import('./analyticsService');
    await calculateOrganAnalytics(organMatchId);
  }

  // Process workflow rules for all active organ matches
  static async processWorkflowRules(): Promise<void> {
    logger.info('Processing workflow rules...');

    // Get all active workflow templates
    const templates = await prisma.workflowTemplate.findMany({
      where: { isActive: true },
    });

    // Get all active organ matches
    const organMatches = await prisma.organMatch.findMany({
      where: {
        status: { in: ['OFFERED', 'ACCEPTED'] },
      },
    });

    for (const match of organMatches) {
      // Find applicable templates
      const applicableTemplates = templates.filter(
        (t) => !t.organType || t.organType === match.organType
      );

      for (const template of applicableTemplates) {
        const stages = template.stages as any[];

        for (const stage of stages) {
          if (stage.automationRules) {
            for (const rule of stage.automationRules) {
              // Check if conditions are met
              const conditionsMet = await this.evaluateConditions(
                match.id,
                rule.conditions || []
              );

              if (conditionsMet) {
                logger.info(
                  `Automation rule triggered for organ match ${match.id}: ${rule.name}`
                );
                await this.executeActions(match.id, rule.actions || []);
              }
            }
          }
        }
      }
    }

    logger.info('Workflow rules processing complete');
  }
}

// Schedule workflow automation checks every 5 minutes
export function startWorkflowAutomation() {
  setInterval(async () => {
    try {
      await WorkflowAutomation.processWorkflowRules();
    } catch (error) {
      logger.error('Error processing workflow rules:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  logger.info('Workflow automation engine started');
}

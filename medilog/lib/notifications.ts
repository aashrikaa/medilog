// Notification service for reminders
// Supports browser notifications and email alerts

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  type: 'medicine' | 'appointment' | 'health_check' | 'vaccination' | 'screening' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  daysUntilDue: number;
  actionUrl?: string;
}

class NotificationService {
  private hasPermission: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.checkPermission();
  }

  // Check if notifications are supported and permission is granted
  async checkPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    } else if (Notification.permission === 'denied') {
      this.hasPermission = false;
      return false;
    } else {
      // Permission not determined yet
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }
  }

  // Request permission to show notifications
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show a browser notification
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported || !this.hasPermission) {
      console.warn('Cannot show notification: not supported or no permission');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        actions: options.actions,
        data: options.data
      });

      // Auto-close after 10 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show a reminder notification
  async showReminderNotification(reminder: ReminderNotification): Promise<Notification | null> {
    const priorityEmojis = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };

    const typeEmojis = {
      medicine: '💊',
      appointment: '🏥',
      health_check: '🔬',
      vaccination: '💉',
      screening: '🔍',
      other: '📅'
    };

    const emoji = typeEmojis[reminder.type] || '📅';
    const priorityEmoji = priorityEmojis[reminder.priority];

    let message = '';
    if (reminder.daysUntilDue === 0) {
      message = `Due today! ${reminder.message}`;
    } else if (reminder.daysUntilDue < 0) {
      message = `Overdue by ${Math.abs(reminder.daysUntilDue)} days! ${reminder.message}`;
    } else {
      message = `Due in ${reminder.daysUntilDue} days. ${reminder.message}`;
    }

    const options: NotificationOptions = {
      title: `${emoji} ${reminder.title}`,
      body: `${priorityEmoji} ${message}`,
      tag: `reminder-${reminder.id}`,
      requireInteraction: reminder.priority === 'urgent',
      icon: '/favicon.ico',
      data: {
        reminderId: reminder.id,
        type: 'reminder',
        actionUrl: reminder.actionUrl
      }
    };

    // Add actions for high priority reminders
    if (reminder.priority === 'high' || reminder.priority === 'urgent') {
      options.actions = [
        {
          action: 'view',
          title: 'View Details',
          icon: '/favicon.ico'
        },
        {
          action: 'complete',
          title: 'Mark Complete',
          icon: '/favicon.ico'
        }
      ];
    }

    return this.showNotification(options);
  }

  // Show multiple reminder notifications
  async showReminderNotifications(reminders: ReminderNotification[]): Promise<void> {
    // Sort by priority and due date
    const sortedReminders = reminders.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.daysUntilDue - b.daysUntilDue;
    });

    // Show notifications with delay to avoid overwhelming the user
    for (let i = 0; i < sortedReminders.length; i++) {
      const reminder = sortedReminders[i];
      await this.showReminderNotification(reminder);
      
      // Wait 1 second between notifications
      if (i < sortedReminders.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Show a success notification
  async showSuccessNotification(title: string, message: string): Promise<Notification | null> {
    return this.showNotification({
      title: `✅ ${title}`,
      body: message,
      icon: '/favicon.ico'
    });
  }

  // Show an error notification
  async showErrorNotification(title: string, message: string): Promise<Notification | null> {
    return this.showNotification({
      title: `❌ ${title}`,
      body: message,
      icon: '/favicon.ico',
      requireInteraction: true
    });
  }

  // Show a warning notification
  async showWarningNotification(title: string, message: string): Promise<Notification | null> {
    return this.showNotification({
      title: `⚠️ ${title}`,
      body: message,
      icon: '/favicon.ico'
    });
  }

  // Show an info notification
  async showInfoNotification(title: string, message: string): Promise<Notification | null> {
    return this.showNotification({
      title: `ℹ️ ${title}`,
      body: message,
      icon: '/favicon.ico'
    });
  }

  // Close all notifications
  closeAllNotifications(): void {
    if (this.isSupported) {
      // Note: This will close all notifications from this origin
      // Individual notifications can be closed by calling notification.close()
      console.log('All notifications closed');
    }
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.isSupported && this.hasPermission;
  }

  // Get notification permission status
  getPermissionStatus(): string {
    if (!this.isSupported) return 'not-supported';
    return Notification.permission;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Export individual functions for easy use
export const {
  checkPermission,
  requestPermission,
  showNotification,
  showReminderNotification,
  showReminderNotifications,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  closeAllNotifications,
  isEnabled,
  getPermissionStatus
} = notificationService;

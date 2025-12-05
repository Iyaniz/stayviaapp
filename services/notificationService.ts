import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { googleCalendarService } from './googleCalendarService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Request notification permissions and get push token
   */
  async getPushToken(): Promise<string | null> {
    try {
      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('ℹ️ Notification permissions not granted');
        return null;
      }

      // Only try to get push token on physical devices
      if (!Device.isDevice) {
        console.log('ℹ️ Simulator - local notifications only (no push token)');
        return null;
      }

      // Try to get push token, but don't fail if Firebase isn't configured
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('✅ Push token obtained successfully');
        return token.data;
      } catch (tokenError: any) {
        // Check if it's a Firebase initialization error
        if (tokenError?.message?.includes('FirebaseApp')) {
          console.log('ℹ️ Firebase not configured - using local notifications only');
          console.log(
            'ℹ️ To enable push notifications, set up Firebase: https://docs.expo.dev/push-notifications/fcm-credentials/'
          );
        } else {
          console.warn('⚠️ Could not get push token:', tokenError?.message);
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Error in getPushToken:', error);
      return null;
    }
  },

  /**
   * Send a local notification (for testing)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delaySeconds: number = 1
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          seconds: delaySeconds,
        } as any,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  },

  /**
   * Send rating reminder notification to tenant
   */
  async sendRatingReminderNotification(postTitle: string) {
    try {
      await this.sendLocalNotification(
        '⭐ Time to rate your stay!',
        `It's time to rate your experience at ${postTitle}. Share your feedback!`,
        { type: 'rating_reminder', action: 'open_ratings' },
        2
      );
    } catch (error) {
      console.error('Error sending rating reminder:', error);
    }
  },

  /**
   * Schedule rating reminder notification for 7 days after move-in date
   * This notification will fire even when the app is closed
   */
  async scheduleRatingReminderNotification(
    rentalId: string,
    postTitle: string,
    moveInDate: string | Date
  ) {
    try {
      const moveIn = typeof moveInDate === 'string' ? new Date(moveInDate) : moveInDate;
      const notificationDate = new Date(moveIn);
      notificationDate.setDate(notificationDate.getDate() + 7);

      // Don't schedule if the date is in the past
      if (notificationDate <= new Date()) {
        console.log('⚠️ Notification date is in the past, sending immediately instead');
        await this.sendRatingReminderNotification(postTitle);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⭐ Time to rate your stay!',
          body: `It's time to rate your experience at ${postTitle}. Share your feedback!`,
          data: {
            type: 'rating_reminder',
            action: 'open_ratings',
            rentalId,
          },
          sound: true,
          badge: 1,
        },
        trigger: {
          date: notificationDate,
        },
      });

      console.log(
        `✅ Scheduled rating notification for rental ${rentalId} on ${notificationDate.toISOString()}`
      );
    } catch (error) {
      console.error('Error scheduling rating reminder notification:', error);
      // Fallback to immediate notification if scheduling fails
      try {
        await this.sendRatingReminderNotification(postTitle);
      } catch (fallbackError) {
        console.error('Error sending fallback notification:', fallbackError);
      }
    }
  },

  /**
   * Send payment reminder notification to tenant
   */
  async sendPaymentReminderNotification(tenantName: string, amount: number, dueDate: string) {
    try {
      await this.sendLocalNotification(
        '💰 Payment Reminder',
        `${tenantName} has a payment of $${amount} due on ${dueDate}`,
        { type: 'payment_reminder', action: 'open_payments' },
        2
      );
    } catch (error) {
      console.error('Error sending payment reminder:', error);
    }
  },

  /**
   * Create calendar reminder for payment
   */
  async createPaymentCalendarReminder(
    rentalId: string,
    propertyTitle: string,
    amount: number,
    dueDate: Date
  ) {
    try {
      await googleCalendarService.createPaymentEvent({
        date: dueDate,
        amount,
        rentalId,
        propertyTitle,
      });
    } catch (error) {
      console.error('Error creating calendar reminder:', error);
      // Fallback to local notification if calendar fails
      await this.sendLocalNotification(
        '💳 Payment Due',
        `Payment of ₱${amount.toLocaleString()} due for ${propertyTitle}`,
        { type: 'payment_due', rentalId },
        1
      );
    }
  },

  /**
   * Create calendar reminders for all payments in a rental
   */
  async createRentalCalendarReminders(
    rentalId: string,
    propertyTitle: string,
    paymentDates: Date[],
    amount: number
  ) {
    try {
      await googleCalendarService.createRentalPaymentEvents(
        rentalId,
        propertyTitle,
        paymentDates,
        amount
      );
    } catch (error) {
      console.error('Error creating rental calendar reminders:', error);
      // Fallback to local notifications
      for (const date of paymentDates) {
        await this.sendLocalNotification(
          '💳 Payment Scheduled',
          `Payment of ₱${amount.toLocaleString()} scheduled for ${date.toLocaleDateString()}`,
          { type: 'payment_scheduled', rentalId },
          1
        );
      }
    }
  },

  /**
   * Remove calendar reminders for a rental
   */
  async removeRentalCalendarReminders(rentalId: string) {
    try {
      await googleCalendarService.deleteRentalEvents(rentalId);
    } catch (error) {
      console.error('Error removing calendar reminders:', error);
    }
  },

  /**
   * Send payment received notification to tenant
   */
  async sendPaymentReceivedNotification(amount: number, propertyName: string) {
    try {
      await this.sendLocalNotification(
        '✅ Payment Received',
        `Your payment of $${amount} for ${propertyName} has been received`,
        { type: 'payment_received', action: 'open_payments' },
        1
      );
    } catch (error) {
      console.error('Error sending payment received notification:', error);
    }
  },

  /**
   * Listen for notification taps
   */
  setupNotificationResponseListener(
    onResponse: (notification: Notifications.Notification) => void
  ) {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      onResponse(response.notification);
    });

    return () => subscription.remove();
  },

  /**
   * Listen for notifications while app is in foreground
   */
  setupForegroundNotificationListener(
    onNotification: (notification: Notifications.Notification) => void
  ) {
    const subscription = Notifications.addNotificationReceivedListener(onNotification);

    return () => subscription.remove();
  },

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string) {
    try {
      // Note: expo-notifications doesn't have cancelNotificationAsync
      // Use dismissNotificationAsync instead if available
      await Notifications.dismissNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },
};

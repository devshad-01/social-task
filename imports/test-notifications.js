// Test file to verify notification functionality
import { Meteor } from 'meteor/meteor';

// Test notification creation
if (Meteor.isServer) {
  Meteor.startup(() => {
    // Test method for creating notifications
    Meteor.methods({
      'test.createNotification': function(userId, notificationData) {
        if (!userId) {
          throw new Meteor.Error('unauthorized', 'User must be logged in');
        }
        
        return Meteor.call('notifications.create', userId, notificationData);
      }
    });
  });
}

// Test notification methods on client
if (Meteor.isClient) {
  window.testNotifications = {
    createTestNotification: () => {
      const userId = Meteor.userId();
      if (!userId) {
        console.error('User must be logged in');
        return;
      }
      
      const testNotification = {
        title: 'Test Notification',
        message: 'This is a test notification to verify the system works',
        type: 'test',
        priority: 'medium'
      };
      
      Meteor.call('test.createNotification', userId, testNotification, (error, result) => {
        if (error) {
          console.error('Error creating test notification:', error);
        } else {
          console.log('Test notification created:', result);
        }
      });
    },
    
    markAllAsRead: () => {
      Meteor.call('notifications.markAllAsRead', (error) => {
        if (error) {
          console.error('Error marking all as read:', error);
        } else {
          console.log('All notifications marked as read');
        }
      });
    }
  };
}

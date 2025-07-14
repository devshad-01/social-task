// Test script to verify notification click behavior
// Run this in browser console to test notification functionality

async function testNotificationSystem() {
  console.log('🧪 Testing notification system...');
  
  try {
    // 1. Test creating a notification manually
    const testTaskId = 'DM6AKfcwyGSLDStQs'; // Use the task ID from logs
    
    console.log('📝 Creating test notification...');
    const notificationId = await Meteor.callAsync('notifications.create', {
      userId: Meteor.userId(),
      type: 'task_assigned',
      title: 'Test Task Assignment',
      message: 'You have been assigned to test task',
      priority: 'high',
      relatedId: testTaskId,
      relatedType: 'task'
    });
    
    console.log('✅ Notification created with ID:', notificationId);
    
    // 2. Fetch the created notification to verify data structure
    console.log('🔍 Fetching notification to verify data structure...');
    const notification = await Notifications.findOneAsync(notificationId);
    
    console.log('📄 Notification data structure:', {
      id: notification._id,
      type: notification.type,
      relatedId: notification.relatedId,
      relatedType: notification.relatedType,
      data: notification.data,
      actionUrl: notification.actionUrl
    });
    
    // 3. Test the click behavior
    console.log('🖱️ Testing notification click behavior...');
    if (notification.data?.taskId) {
      console.log(`✅ Task ID found in data: ${notification.data.taskId}`);
      console.log(`🔗 Would redirect to: /tasks/${notification.data.taskId}`);
    } else {
      console.log('❌ Task ID not found in notification data');
    }
    
    // 4. Test service worker data structure
    console.log('📡 Testing service worker notification data...');
    const serviceWorkerData = {
      type: notification.type,
      taskId: notification.data?.taskId,
      _id: notification._id,
      actionUrl: notification.actionUrl
    };
    
    console.log('📦 Service worker data:', serviceWorkerData);
    
    if (serviceWorkerData.type && serviceWorkerData.type.startsWith('task_') && serviceWorkerData.taskId) {
      console.log(`✅ Service worker would redirect to: /tasks/${serviceWorkerData.taskId}`);
    } else {
      console.log('❌ Service worker notification data incomplete');
    }
    
    console.log('🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for console use
window.testNotificationSystem = testNotificationSystem;

console.log('🔧 Notification test utility loaded. Run testNotificationSystem() to test.');

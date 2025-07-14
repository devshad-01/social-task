// Test notification clicking for Android compatibility
// Run this in the browser console to test notifications

async function testNotifications() {
  console.log('Testing notification system...');
  
  // Import WebPushService
  const { WebPushService } = await import('/imports/api/notifications/webPush.js');
  
  // Test 1: Basic notification with task data
  console.log('Test 1: Basic notification with task data');
  const result1 = await WebPushService.sendNotification({
    title: 'Test Task Notification',
    message: 'This is a test task notification',
    actionUrl: '/tasks/test-task-123',
    data: {
      type: 'task_assigned',
      taskId: 'test-task-123'
    }
  });
  console.log('Test 1 result:', result1);
  
  // Test 2: Notification without actionUrl (should use taskId fallback)
  console.log('Test 2: Notification without actionUrl');
  const result2 = await WebPushService.sendNotification({
    title: 'Test Task Notification (No URL)',
    message: 'This notification should use taskId fallback',
    data: {
      type: 'task_completed',
      taskId: 'test-task-456'
    }
  });
  console.log('Test 2 result:', result2);
  
  // Test 3: Test service worker registration
  console.log('Test 3: Service worker registration check');
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker ready:', registration);
    console.log('Service worker scope:', registration.scope);
  } else {
    console.log('Service worker not supported');
  }
  
  // Test 4: Test notification permission
  console.log('Test 4: Notification permission check');
  console.log('Permission status:', Notification.permission);
  
  return {
    basicNotification: result1,
    fallbackNotification: result2,
    hasServiceWorker: 'serviceWorker' in navigator,
    notificationPermission: Notification.permission
  };
}

// Export for console usage
window.testNotifications = testNotifications;

console.log('Notification test loaded. Run window.testNotifications() to test.');

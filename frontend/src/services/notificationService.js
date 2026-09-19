// frontend/src/services/notificationService.js

// Request permission and register service worker
export const initializeNotifications = async () => {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return false;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

// Show a local notification immediately
export const showNotification = (title, body, options = {}) => {
  try {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: options.requireInteraction || false,
        tag: options.tag || 'expense-notification',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, options.duration || 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };

      return notification;
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Show budget alert notification
export const showBudgetAlert = (category, percentageUsed, remaining) => {
  const isExceeded = percentageUsed >= 100;
  
  showNotification(
    isExceeded ? '🚨 Budget Exceeded!' : '⚠️ Budget Alert!',
    isExceeded
      ? `Your ${category} budget has been exceeded! You have overspent by ₹${Math.abs(remaining).toFixed(2)}`
      : `You've used ${percentageUsed}% of your ${category} budget. Only ₹${remaining.toFixed(2)} remaining!`,
    {
      tag: `budget-${category}`,
      requireInteraction: isExceeded,
      url: '/budget',
      duration: isExceeded ? 10000 : 6000
    }
  );
};

// Show expense added notification
export const showExpenseAdded = (merchant, amount, category) => {
  showNotification(
    '✅ Expense Added!',
    `₹${amount} at ${merchant} (${category}) has been recorded.`,
    {
      tag: 'expense-added',
      url: '/expenses',
      duration: 4000
    }
  );
};

// Show receipt processed notification
export const showReceiptProcessed = (merchant, amount) => {
  showNotification(
    '📸 Receipt Processed!',
    `Receipt from ${merchant} for ₹${amount} has been scanned and added to your expenses.`,
    {
      tag: 'receipt-processed',
      url: '/expenses',
      duration: 5000
    }
  );
};

// Check budget alerts and notify
export const checkAndNotifyBudgetAlerts = async (budgetAPI) => {
  try {
    const response = await budgetAPI.checkAlerts();
    const { alerts } = response.data;

    if (alerts && alerts.length > 0) {
      alerts.forEach((alert, index) => {
        // Stagger notifications by 1 second each
        setTimeout(() => {
          showBudgetAlert(
            alert.category,
            parseFloat(alert.percentageUsed),
            alert.remaining
          );
        }, index * 1500);
      });
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
};

// Get notification permission status
export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'not-supported';
  return Notification.permission;
};
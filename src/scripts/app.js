import Model from './model.js';
import { View } from './view.js';
import Presenter from './presenter.js';
import Router from './router.js';

const app = (() => {
  const model = new Model();
  const view = new View();
  const presenter = new Presenter({ model, view });
  const router = new Router({ presenter, model });

  // Push Notification Configuration
  const publicVapidKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

  // Register Service Worker
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        // Send subscription to server
        await fetch('/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Push Notification subscription successful');

        // Handle unsubscribe when user logs out
        window.addEventListener('user-logout', async () => {
          try {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              await fetch('/notifications/subscribe', {
                method: 'DELETE',
                body: JSON.stringify(subscription),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              await subscription.unsubscribe();
              console.log('Push Notification unsubscribed');
            }
          } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return {
    model,
    view,
    presenter,
    router,
  };
})();

export default app;

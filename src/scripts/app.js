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
        // Request notification permission first
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
        }

        // Register the new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker registered:', registration);

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');

        // Wait for the service worker to be activated
        if (registration.active) {
          console.log('Service Worker is active');
        } else {
          console.log('Waiting for Service Worker to activate...');
          await new Promise((resolve) => {
            if (registration.active) {
              resolve();
            } else {
              registration.addEventListener('activate', () => {
                console.log('Service Worker activated');
                resolve();
              });
            }
          });
        }

        try {
          // Check if already subscribed
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            // Convert VAPID key
            const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
            
            // Subscribe to push notifications with retry
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
              try {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey
                });
                console.log('Push Notification subscription created:', subscription);
                break;
              } catch (error) {
                retryCount++;
                console.warn(`Push subscription attempt ${retryCount} failed:`, error);
                if (retryCount === maxRetries) {
                  throw error;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }

            // Send subscription to server
            try {
              const response = await fetch('/notifications/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
              }
              
              console.log('Push Notification subscription sent to server');
            } catch (error) {
              console.error('Failed to send subscription to server:', error);
              // Unsubscribe if server registration fails
              await subscription.unsubscribe();
              throw error;
            }
          } else {
            console.log('Push Notification already subscribed:', subscription);
          }
        } catch (error) {
          console.error('Push subscription failed:', error);
          // Show user-friendly error message
          if (error.name === 'AbortError') {
            console.error('Push service error. Please check your internet connection and try again.');
          } else {
            console.error('Failed to subscribe to push notifications:', error);
          }
        }

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
    try {
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
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
  }

  return {
    model,
    view,
    presenter,
    router,
  };
})();

export default app;

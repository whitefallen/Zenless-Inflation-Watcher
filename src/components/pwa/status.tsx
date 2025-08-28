'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for SW updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return (
    <>
      {/* Online/Offline Status */}
      {(showStatus || !isOnline) && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm shadow-lg transition-all duration-300',
            isOnline
              ? 'bg-green-500'
              : 'bg-red-500'
          )}
        >
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span>
            {isOnline ? 'Back online' : 'You\'re offline'}
          </span>
        </div>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <div>
                <div className="font-semibold text-sm">Update Available</div>
                <div className="text-xs opacity-90">Refresh to get the latest version</div>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              className="ml-2 px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PWAStatus;

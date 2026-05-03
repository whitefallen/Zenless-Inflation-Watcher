'use client';

import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const reloadOnController = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    const handleOffline = () => { setIsOnline(false); setShowStatus(true); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      // Reload once the new SW takes control (triggered by SKIP_WAITING below)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloadOnController.current) window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        // Already a waiting worker (e.g. page was open when SW updated)
        if (registration.waiting) {
          setUpdateAvailable(true);
          return;
        }
        // New worker installs while page is open
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (!('serviceWorker' in navigator)) { window.location.reload(); return; }
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        // Tell the waiting SW to activate; reload once controllerchange fires
        reloadOnController.current = true;
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // skipWaiting:true already activated the SW — just reload
        window.location.reload();
      }
    });
  };

  return (
    <>
      {(showStatus || !isOnline) && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm shadow-lg transition-all duration-300',
          isOnline ? 'bg-green-500' : 'bg-red-500'
        )}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span>{isOnline ? 'Back online' : "You're offline"}</span>
        </div>
      )}

      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
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

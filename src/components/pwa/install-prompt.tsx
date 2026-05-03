'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    const canShow = daysSinceDismissed > 7;

    if (iOS) {
      // Show iOS instructions if not dismissed recently
      if (canShow) setShowPrompt(true);
      return;
    }

    // Non-iOS: wait for the browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (canShow) setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome !== 'accepted') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {isIOS ? (
            <Smartphone className="h-6 w-6 mt-1 flex-shrink-0" />
          ) : (
            <Download className="h-6 w-6 flex-shrink-0 mt-1" />
          )}
          <div>
            <h3 className="font-semibold text-sm">Install ZZZ Records</h3>
            {isIOS ? (
              <p className="text-xs opacity-90 mt-1">
                Tap <span className="font-mono">□↗</span> then &quot;Add to Home Screen&quot;
              </p>
            ) : (
              <p className="text-xs opacity-90">Get faster access and offline support</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {!isIOS && deferredPrompt && (
            <Button
              onClick={handleInstallClick}
              size="sm"
              variant="secondary"
              className="text-xs px-3 py-1 bg-white text-purple-700 hover:bg-gray-100"
            >
              Install
            </Button>
          )}
          <button onClick={handleDismiss} className="p-1 hover:bg-white/20 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;

import { useEffect, useState } from 'react';

const REFRESH_MS = 30 * 60 * 1000;

// Renew subscriptions without leaving fullscreen or restarting the TV slides.
export function usePosterRefresh() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let lastRefresh = Date.now();
    const refresh = () => {
      lastRefresh = Date.now();
      setRevision((value) => value + 1);
    };
    const resume = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh >= REFRESH_MS) refresh();
    };
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('online', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return revision;
}

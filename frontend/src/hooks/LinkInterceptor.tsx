"use client";

import { useEffect, useState } from 'react';
import LinkWarning from '@/components/LinkWarning/LinkWarning';

export function useLinkInterceptor() {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      console.log('Click detected:', e.target);
      
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link) {
        console.log('No link found');
        return;
      }
      
      const href = link.getAttribute('href');
      console.log('Link href:', href);
      
      if (!href) {
        console.log('No href found');
        return;
      }

      // Check if it's an external link
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      const isCurrentDomain = href.includes(window.location.hostname);
      
      console.log('Is external:', isExternal, 'Is current domain:', isCurrentDomain);
      
      if (isExternal && !isCurrentDomain) {
        console.log('Intercepting external link:', href);
        e.preventDefault();
        e.stopImmediatePropagation();
        setPendingUrl(href);
        setShowWarning(true);
        return false;
      }
    };

    // Add event listener with capture = true to catch before other handlers
    document.addEventListener('click', handleClick, { capture: true, passive: false });
    console.log('Link interceptor installed');

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      console.log('Link interceptor removed');
    };
  }, []);

  const handleConfirm = () => {
    if (pendingUrl) {
      console.log('Opening confirmed link:', pendingUrl);
      window.open(pendingUrl, '_blank', 'noopener,noreferrer');
    }
    setShowWarning(false);
    setPendingUrl(null);
  };

  const handleCancel = () => {
    console.log('Link cancelled');
    setShowWarning(false);
    setPendingUrl(null);
  };

  const LinkWarningComponent = () => (
    <LinkWarning
      url={pendingUrl || ''}
      isOpen={showWarning}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { LinkWarningComponent };
}
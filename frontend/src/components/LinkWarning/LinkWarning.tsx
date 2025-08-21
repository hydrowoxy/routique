"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/Button/Button';
import AccentButton from '@/components/AccentButton/AccentButton';
import styles from './LinkWarning.module.scss';

interface LinkWarningProps {
  url: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LinkWarning({ url, isOpen, onConfirm, onCancel }: LinkWarningProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>External Link Warning</h2>
        </div>
        
        <div className={styles.content}>
          <p>You are about to visit an external website:</p>
          <div className={styles.urlContainer}>
            <div className={styles.urlBox}>
              <code>{url}</code>
              <button 
                className={styles.copyButton}
                onClick={handleCopyLink}
                title="Copy link"
              >
                {copied ? 'copied!' : 'copy link'}
              </button>
            </div>
          </div>
          <p className={styles.disclaimer}>
            This link was posted by a user. You&#39;re leaving Routique for a third-party site we don&#39;t control or review. We don&#39;t endorse external content and disclaim all responsibility and liability. Continue only if you trust it.
          </p>
          <p className={styles.disclaimer}>By clicking Continue, you acknowledge the above.</p>
        </div>

        <div className={styles.actions}>
          <AccentButton onClick={onCancel}>
            Cancel
          </AccentButton>
          <Button onClick={onConfirm}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
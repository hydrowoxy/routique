"use client";

import { useEffect, useState } from 'react';
import styles from './Toast.module.scss';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  if (!isVisible && !isClosing) return null;

  return (
    <div 
      className={`${styles.toast} ${styles[type]} ${isClosing ? styles.closing : ''}`}
      onClick={handleClose}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          {type === 'error' && '⚠️'}
          {type === 'success' && '✅'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        <div className={styles.message}>
          {message}
        </div>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
}
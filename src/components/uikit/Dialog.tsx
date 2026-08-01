
import React, { useEffect, useRef } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { clsx } from 'clsx';

const dialog = tv({
  slots: {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50',
    content: 'fixed z-50 bg-white dark:bg-[var(--bm-surface)] shadow-2xl w-full border border-gray-200 dark:border-gray-700',
    // Default positioning is center, can be overridden by className
    positioner: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  }
});

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Allows to override the default centered position
  positionerClassName?: string;
}

export function Dialog({ 
    isOpen, 
    onClose, 
    children,
    className,
    positionerClassName,
    ...props
}: DialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { overlay, content, positioner } = dialog();

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    firstElement.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    modalRef.current.addEventListener('keydown', handleTabKey);

    return () => {
      modalRef.current?.removeEventListener('keydown', handleTabKey);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={clsx(positioner(), positionerClassName)}>
         <div className={overlay()} onClick={onClose} />
        <div
            ref={modalRef}
            className={clsx('animate-in fade-in-0 zoom-in-95', content(), className)}
            role="dialog"
            aria-modal="true"
            {...props}
        >
            {children}
        </div>
    </div>
  );
}

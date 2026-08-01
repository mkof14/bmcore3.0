
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { tv, type VariantProps } from 'tailwind-variants';
import { clsx } from 'clsx';
import { Button } from './Button';

const modal = tv({
  slots: {
    base: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
    content: 'bg-white dark:bg-[var(--bm-surface)] rounded-2xl shadow-2xl w-full border border-gray-200 dark:border-gray-700 overflow-hidden',
    header: 'p-6 border-b border-gray-200 dark:border-gray-700',
    headerContent: 'flex items-center justify-between',
    headerText: 'flex items-center gap-3',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    description: 'text-sm text-gray-600 dark:text-gray-400',
    body: 'p-6 max-h-[60vh] overflow-y-auto',
    footer: 'p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-3',
  },
  variants: {
    size: {
      sm: { content: 'max-w-md' },
      md: { content: 'max-w-xl' },
      lg: { content: 'max-w-3xl' },
      xl: { content: 'max-w-5xl' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const { base, content, header, headerContent, headerText, title, description, body, footer } = modal();

interface ModalProps extends VariantProps<typeof modal> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  footerContent?: React.ReactNode;
  icon?: React.ReactNode;
  hideCloseButton?: boolean;
}

export function Modal({ 
    isOpen, 
    onClose, 
    children, 
    title: titleText,
    description: descriptionText,
    footerContent,
    icon,
    size,
    hideCloseButton = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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
    <div className={base()} onClick={onClose}>
      <div 
        ref={modalRef}
        className={clsx('animate-in fade-in-0 zoom-in-95', content({ size }))}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleText ? 'modal-title' : undefined}
        aria-describedby={descriptionText ? 'modal-description' : undefined}
      >
        {(titleText || descriptionText) && (
            <div className={header()}>
                <div className={headerContent()}>
                    <div className={headerText()}>
                        {icon}
                        <div>
                            {titleText && <h2 id="modal-title" className={title()}>{titleText}</h2>}
                            {descriptionText && <p id="modal-description" className={description()}>{descriptionText}</p>}
                        </div>
                    </div>
                    {!hideCloseButton && (
                        <Button variant="ghost" size="sm" onClick={onClose} className="p-2 -mr-2">
                            <X className="w-5 h-5 text-gray-500" />
                        </Button>
                    )}
                </div>
            </div>
        )}

        <div className={body()}>
          {children}
        </div>

        {footerContent && (
            <div className={footer()}>
                {footerContent}
            </div>
        )}
      </div>
    </div>
  );
}

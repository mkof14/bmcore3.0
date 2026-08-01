import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalShellProps = {
  title: string;
  icon?: ReactNode;
  onClose?: () => void;
  showClose?: boolean;
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export default function ModalShell({
  title,
  icon,
  onClose,
  showClose = true,
  className,
  panelClassName,
  bodyClassName,
  children
}: ModalShellProps) {
  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${className || ''}`}>
      <div className={`bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-h-[90vh] overflow-y-auto ${panelClassName || ''}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        <div className={`p-6 ${bodyClassName || ''}`}>{children}</div>
      </div>
    </div>
  );
}

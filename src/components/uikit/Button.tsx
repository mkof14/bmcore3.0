
import { tv, type VariantProps } from 'tailwind-variants';
import { clsx } from 'clsx';
import React from 'react';
import { Spinner } from './Spinner';

const button = tv({
  base: 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    variant: {
      primary:
        'rounded-lg border border-orange-500/45 bg-transparent text-orange-700 hover:border-orange-500 hover:bg-orange-500 hover:text-white focus-visible:ring-orange-500 dark:text-orange-300 dark:hover:bg-orange-500 dark:hover:text-white',
      secondary:
        'bg-transparent text-gray-700 underline-offset-4 hover:text-orange-600 hover:underline focus-visible:ring-orange-500 dark:text-gray-300 dark:hover:text-orange-400',
      ghost:
        'bg-transparent text-gray-700 underline-offset-4 hover:text-orange-600 hover:underline focus-visible:ring-orange-500 dark:text-gray-300 dark:hover:text-orange-400',
      destructive: 'rounded-lg bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500',
      info: 'rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500',
    },
    size: {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    },
    isLoading: {
        true: 'relative text-transparent',
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Omit<ButtonVariants, 'isLoading'> {
  className?: string;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, isLoading, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(button({ variant, size, isLoading }), className)}
      {...props}
      disabled={isLoading || props.disabled}
    >
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" className="text-white"/>
            </div>
        )}
      <span className={isLoading ? 'invisible' : ''}>{children}</span>
    </button>
  );
});

Button.displayName = 'Button';

export { Button, button };



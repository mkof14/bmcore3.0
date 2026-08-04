import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
  primary:
    'rounded-lg border border-orange-500/45 bg-transparent text-orange-700 hover:border-orange-500 hover:bg-orange-500 hover:text-white dark:text-orange-300 dark:hover:bg-orange-500 dark:hover:text-white',
  secondary:
    'bg-transparent text-gray-700 underline-offset-4 hover:text-orange-600 hover:underline dark:text-gray-300 dark:hover:text-orange-400',
  outline:
    'rounded-lg border border-orange-500/35 bg-transparent text-orange-700 hover:border-orange-500 hover:bg-orange-500 hover:text-white dark:text-orange-300 dark:hover:bg-orange-500 dark:hover:text-white',
  ghost:
    'bg-transparent text-gray-600 underline-offset-4 hover:text-orange-600 hover:underline dark:text-gray-300 dark:hover:text-orange-400',
  danger: 'rounded-lg bg-red-600 hover:bg-red-700 text-white',
  success: 'rounded-lg bg-green-600 hover:bg-green-700 text-white',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const classes = [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
  return <button className={classes} {...props} />;
}

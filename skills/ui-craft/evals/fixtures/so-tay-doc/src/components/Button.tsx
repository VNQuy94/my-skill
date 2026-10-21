import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent/90',
  secondary: 'bg-surface text-ink border border-line hover:bg-canvas',
  ghost: 'text-accent hover:bg-accent/10',
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 type-label transition-colors duration-(--motion-fast) ease-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

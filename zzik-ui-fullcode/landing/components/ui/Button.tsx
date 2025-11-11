import { forwardRef, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "btn",
          variant === 'outline' && "bg-transparent text-[oklch(65%_0.20_35)] border border-[oklch(65%_0.20_35)]",
          variant === 'secondary' && "bg-[oklch(48%_0.13_245)]",
          size === 'sm' && "text-sm px-3 py-2",
          size === 'lg' && "text-lg px-5 py-3",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

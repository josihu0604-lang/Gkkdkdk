import { forwardRef, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'outline', size?: 'sm'|'md'|'lg' };
export const Button = forwardRef<HTMLButtonElement, Props>(({className,variant='primary',size='md',...props},ref)=>(
  <button ref={ref} className={clsx(
    "btn",
    variant==='outline' && "bg-transparent text-[oklch(50%_0.18_290)] border border-[oklch(50%_0.18_290)]",
    size==='sm' && "text-sm px-3 py-2", size==='lg' && "text-lg px-5 py-3",
    className)} {...props} />
));
Button.displayName='Button';
export default Button;

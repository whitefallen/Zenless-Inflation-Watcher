import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap border text-sm font-semibold uppercase tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            'border-[#ffd400] bg-[#ffd400] text-[#0a0a0b] shadow hover:bg-[#e0bb00]': variant === 'default',
            'border-[#2b2b33] bg-[#18181d] text-[#f4f4f0] shadow-sm hover:bg-[#202028]': variant === 'secondary',
            'border-[#3a3a42] bg-[#0a0a0b] text-[#f4f4f0] shadow-sm hover:bg-[#18181d]': variant === 'outline',
            'border-transparent text-[#f4f4f0] hover:border-[#3a3a42] hover:bg-[#18181d]': variant === 'ghost',
            'border-[#ff3d2e] bg-[#ff3d2e] text-[#0a0a0b] shadow-sm hover:bg-[#df3328]': variant === 'destructive',
          },
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

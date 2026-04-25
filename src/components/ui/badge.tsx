import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-xs font-bold tracking-wider uppercase w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-[#f5c842]/30 bg-[#f5c842]/10 text-[#f5c842]",
        secondary:
          "border-[#1e2438] bg-[#1e2130] text-[#e8e0cc]",
        destructive:
          "border-[#ff4d4d]/30 bg-[#ff4d4d]/10 text-[#ff4d4d]",
        outline:
          "border-[#1e2438] text-[#e8e0cc] hover:border-[#2a3050]",
        cyan:
          "border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]",
        purple:
          "border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))', ...(props as React.HTMLAttributes<HTMLElement>).style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

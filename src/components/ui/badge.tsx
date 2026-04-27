import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-0.5 text-xs font-bold uppercase tracking-normal whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-[#ffd400]/35 bg-[#ffd400]/10 text-[#ffd400]",
        secondary:
          "border-[#2b2b33] bg-[#18181d] text-[#f4f4f0]",
        destructive:
          "border-[#ff3d2e]/35 bg-[#ff3d2e]/10 text-[#ff3d2e]",
        outline:
          "border-[#3a3a42] text-[#f4f4f0] hover:border-[#5a5a62]",
        cyan:
          "border-[#2be0ff]/35 bg-[#2be0ff]/10 text-[#2be0ff]",
        purple:
          "border-[#2be0ff]/35 bg-[#2be0ff]/10 text-[#2be0ff]",
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
      style={(props as React.HTMLAttributes<HTMLElement>).style}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

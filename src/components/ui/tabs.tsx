"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-full max-w-full items-center gap-2 overflow-x-auto border-b border-[#3a3a42] bg-transparent pb-3 text-[#8f919c]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center border px-4",
        "text-[0.72rem] font-semibold tracking-normal uppercase whitespace-nowrap",
        "border-[#2b2b33] bg-[#131316] text-[#8f919c] transition-colors duration-150",
        "hover:border-[#3a3a42] hover:text-[#f4f4f0]",
        "data-[state=active]:border-[#ffd400] data-[state=active]:bg-[#ffd400] data-[state=active]:text-[#0a0a0b]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffd400]/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

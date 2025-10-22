/**
 * Loading skeleton components for better perceived performance
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

/**
 * Table skeleton for loading tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * Chart skeleton for loading charts
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-1/4 mb-4" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

/**
 * Accordion skeleton for loading accordion items
 */
export function AccordionSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Team display skeleton
 */
export function TeamDisplaySkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-12 rounded-full" />
      ))}
    </div>
  );
}

/**
 * Page skeleton for full page loading
 */
export function PageSkeleton() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-1/3 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

import type { DeadlyAssaultData } from "@/types/deadly-assault";
import React from "react";

// Placeholder: Filtering controls for analytics dashboard
export function FilteringControls({ allData, onFilter }: { allData: DeadlyAssaultData[]; onFilter: (filtered: DeadlyAssaultData[]) => void }) {
  // For now, just a stub UI
  return (
    <div className="mb-4 flex gap-2 items-center">
      <span className="text-muted-foreground">[Filtering controls coming soon]</span>
    </div>
  );
}

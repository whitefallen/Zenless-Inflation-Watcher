import { cleanBuffText } from "@/lib/format-utils";
import type { DeadlyAssaultRun } from "@/types/deadly-assault";

export function BuffsList({ floor }: { floor: DeadlyAssaultRun }) {
  if (!floor.buffer.length) return null;
  return (
    <div>
      <h4 className="font-medium mb-2">Buffs</h4>
      <div className="space-y-2">
        {floor.buffer.map((buff, index) => (
          <div key={index} className="text-sm">
            <p className="font-medium">{buff.name}</p>
            <p className="text-muted-foreground whitespace-pre-line">{cleanBuffText(buff.desc)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

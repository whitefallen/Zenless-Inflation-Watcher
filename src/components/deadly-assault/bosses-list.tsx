import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import type { DeadlyAssaultRun } from "@/types/deadly-assault";

export function BossesList({ floor }: { floor: DeadlyAssaultRun }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Bosses</h4>
      <div className="flex flex-wrap gap-4">
        {floor.boss.map((boss, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Avatar>
              <Image 
                src={boss.icon} 
                alt={boss.name}
                width={40}
                height={40}
                unoptimized
              />
            </Avatar>
            <div>
              <p className="text-sm font-medium">{boss.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

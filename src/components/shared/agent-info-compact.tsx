import Image from "next/image";
import { GradeBadge } from "@/components/ui/grade-badge";

interface AgentInfoCompactProps {
  name: string;
  weaponType: string;
  elementType: string;
  rarity: number;
  iconUrl: string;
}

export function AgentInfoCompact({ name, weaponType, elementType, rarity, iconUrl }: AgentInfoCompactProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={iconUrl}
        alt={name}
        width={32}
        height={32}
        className="rounded border"
        unoptimized
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm leading-tight">{name}</span>
          <GradeBadge stars={rarity} size="xs" />
        </div>
        <span className="text-xs text-muted-foreground">
          {weaponType} • {elementType}
        </span>
      </div>
    </div>
  );
}

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
    <div className="flex items-center gap-2 relative group">
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
      
      {/* Tooltip for hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 backdrop-blur-sm border border-gray-600">
        <div className="font-medium">{name}</div>
        <div className="text-yellow-400">{rarity+1}-star • {weaponType}</div>
        <div className="text-blue-400">{elementType} Element</div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
  );
}

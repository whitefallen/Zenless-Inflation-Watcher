import Image from "next/image";

interface AgentInfoMiniProps {
  name: string;
  weaponType: string;
  elementType: string;
  rarity: number;
  iconUrl: string;
}

export function AgentInfoMini({ name, weaponType, elementType, rarity, iconUrl }: AgentInfoMiniProps) {
  const rarityStars = Array(Math.max(0, Math.min(6, Number(rarity) || 0))).fill('★').join('');
  
  return (
    <div className="flex items-center gap-1 bg-card/50 rounded px-1 py-0.5 border">
      <Image
        src={iconUrl}
        alt={name}
        width={20}
        height={20}
        className="rounded border flex-shrink-0"
        unoptimized
      />
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-xs leading-tight truncate">{name}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="text-yellow-500">{rarityStars}</span>
          <span className="text-xs">•</span>
          <span className="truncate">{elementType}</span>
        </div>
      </div>
    </div>
  );
}

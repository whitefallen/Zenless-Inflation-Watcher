import Image from "next/image";

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
        <span className="font-medium text-sm leading-tight">{name}</span>
        <span className="text-xs text-muted-foreground">
          {weaponType} • {elementType} • {Array(rarity).fill('★').join('')}
        </span>
      </div>
    </div>
  );
}

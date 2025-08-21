import { AgentInfoMini } from "./agent-info-mini";
import { AgentInfoMicro } from "./agent-info-micro";

interface AgentInfo {
  id: number;
  name: string;
  weaponType: string;
  elementType: string;
  rarity: number;
  iconUrl: string;
}

interface ResponsiveTeamDisplayProps {
  agents: AgentInfo[];
  variant?: 'table' | 'card' | 'inline';
  maxAgents?: number;
}

export function ResponsiveTeamDisplay({ 
  agents, 
  variant = 'card',
  maxAgents 
}: ResponsiveTeamDisplayProps) {
  const displayAgents = maxAgents ? agents.slice(0, maxAgents) : agents;
  const hasMore = maxAgents && agents.length > maxAgents;
  
  if (variant === 'table') {
    // Ultra compact for table cells
    return (
      <div className="flex flex-wrap gap-1 max-w-full">
        {displayAgents.map((agent, i) => (
          <AgentInfoMicro
            key={i}
            name={agent.name}
            rarity={agent.rarity}
            iconUrl={agent.iconUrl}
            size="sm"
          />
        ))}
        {hasMore && (
          <span className="text-xs text-muted-foreground self-center">
            +{agents.length - maxAgents!}
          </span>
        )}
      </div>
    );
  }
  
  if (variant === 'inline') {
    // Compact for inline display
    return (
      <div className="flex flex-wrap gap-1">
        <div className="hidden md:flex gap-1 flex-wrap">
          {displayAgents.map((agent, i) => (
            <AgentInfoMini key={i} {...agent} />
          ))}
        </div>
        <div className="md:hidden flex gap-1 flex-wrap">
          {displayAgents.map((agent, i) => (
            <AgentInfoMicro
              key={i}
              name={agent.name}
              rarity={agent.rarity}
              iconUrl={agent.iconUrl}
              size="sm"
              showName={false}
            />
          ))}
        </div>
        {hasMore && (
          <span className="text-xs text-muted-foreground self-center">
            +{agents.length - maxAgents!}
          </span>
        )}
      </div>
    );
  }
  
  // Default card variant - responsive between compact and mini
  return (
    <div className="flex flex-col gap-2">
      <div className="hidden lg:flex flex-col gap-2">
        {displayAgents.map((agent, i) => (
          <AgentInfoMini key={i} {...agent} />
        ))}
      </div>
      <div className="lg:hidden flex flex-wrap gap-1">
        {displayAgents.map((agent, i) => (
          <AgentInfoMini key={i} {...agent} />
        ))}
      </div>
      {hasMore && (
        <span className="text-sm text-muted-foreground">
          +{agents.length - maxAgents!} more
        </span>
      )}
    </div>
  );
}

import { Avatar } from "@/components/ui/avatar";
import { GradeBadge } from "@/components/ui/grade-badge";
import Image from "next/image";
import type { DeadlyAssaultRun } from "@/types/deadly-assault";
import { getAgentInfo } from "@/lib/agent-utils";

export function TeamComposition({ floor }: { floor: DeadlyAssaultRun }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Team Composition</h4>
      <div className="flex flex-wrap gap-4">
        {floor.avatar_list.map((avatar) => {
          const agentInfo = getAgentInfo(avatar.id, {
            role_square_url: avatar.role_square_url,
            rarity: avatar.rarity,
            level: avatar.level,
            element_type: avatar.element_type
          });
          
          return (
            <div key={avatar.id} className="flex items-center space-x-2 relative group">
              <Avatar>
                <Image 
                  src={avatar.role_square_url} 
                  alt={agentInfo?.name || `Character ${avatar.id}`}
                  width={40}
                  height={40}
                  unoptimized
                />
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {agentInfo?.name || `Agent ${avatar.id}`}
                  </p>
                  <GradeBadge stars={agentInfo?.rarity || (typeof avatar.rarity === 'number' ? avatar.rarity : 3)} size="xs" />
                </div>
                <p className="text-xs text-muted-foreground">Lv.{avatar.level}</p>
              </div>
              
              {/* Tooltip for hover */}
              {agentInfo && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 backdrop-blur-sm border border-gray-600">
                  <div className="font-medium">{agentInfo.name}</div>
                  <div className="text-yellow-400">{agentInfo.rarity}-star</div>
                  <div className="text-blue-400">{agentInfo.elementType} Element</div>
                  <div className="text-gray-300">Level {avatar.level}</div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {floor.buddy && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Buddy</p>
          <div className="flex items-center space-x-2 mt-1">
            <Avatar>
              <Image 
                src={floor.buddy.bangboo_rectangle_url} 
                alt={`Buddy ${floor.buddy.id}`}
                width={40}
                height={40}
                unoptimized
              />
            </Avatar>
            <div>
              <p className="text-sm font-medium">ID: {floor.buddy.id}</p>
              <p className="text-xs text-muted-foreground">Lv.{floor.buddy.level} • {floor.buddy.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Avatar } from "@/components/ui/avatar"
import { ResponsiveTeamDisplay } from "@/components/shared/responsive-team-display"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cleanBuffText } from "@/lib/format-utils"
import { FloorDetail } from "@/types/shiyu-defense"
import Image from "next/image"
import { getAgentInfo } from "@/lib/agent-utils";

interface FloorDetailsProps {
  floor: FloorDetail;
  node?: 'node_1' | 'node_2';
}

function FloorDetailCard({ floor, node = 'node_1' }: FloorDetailsProps) {
  // Pick node_1 or node_2 for display
  const nodeData = floor[node];

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{floor.zone_name}</h3>
            <p className="text-sm text-muted-foreground">Layer {floor.layer_index} ({node.replace('_', ' ').toUpperCase()})</p>
          </div>
          <Badge variant={floor.rating === 'S' ? 'default' : 'secondary'}>
            {floor.rating} Rank
          </Badge>
        </div>

        <Separator />

        {/* Battle Information */}
        <div>
          <h4 className="font-medium mb-2">Battle Information</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Battle Time</p>
              <p className="font-medium">{nodeData.battle_time}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clear Date</p>
              <p className="font-medium">
                {`${floor.floor_challenge_time.year}-${String(floor.floor_challenge_time.month).padStart(2, '0')}-${String(floor.floor_challenge_time.day).padStart(2, '0')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Team Composition */}
        <div>
          <h4 className="font-medium mb-2">Team Composition</h4>
          <div className="max-w-lg">
            <ResponsiveTeamDisplay
              agents={nodeData.avatars.map((avatar: import("@/types/shiyu-defense").Avatar) => {
                const info = getAgentInfo(avatar.id, { role_square_url: avatar.role_square_url, rarity: avatar.rarity });
                return info || {
                  id: avatar.id,
                  name: `Agent ${avatar.id}`,
                  weaponType: '-',
                  elementType: '-',
                  rarity: 0,
                  iconUrl: avatar.role_square_url || '/placeholder.png'
                };
              })}
              variant="inline"
            />
          </div>
          {nodeData.buddy && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Buddy</p>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar>
                  <Image 
                    src={nodeData.buddy.bangboo_rectangle_url} 
                    alt={`Buddy ${nodeData.buddy.id}`}
                    width={40}
                    height={40}
                    unoptimized
                  />
                </Avatar>
                <div>
                  <p className="text-sm font-medium">ID: {nodeData.buddy.id}</p>
                  <p className="text-xs text-muted-foreground">Lv.{nodeData.buddy.level} • {nodeData.buddy.rarity}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enemies */}
        <div>
          <h4 className="font-medium mb-2">Enemies</h4>
          <div className="flex flex-wrap gap-4">
            {nodeData.monster_info.list.map((monster: import("@/types/shiyu-defense").Monster) => (
              <div key={monster.id} className="flex items-center space-x-2">
                <Avatar>
                  <Image 
                    src={monster.icon_url} 
                    alt={monster.name}
                    width={40}
                    height={40}
                    unoptimized
                  />
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{monster.name}</p>
                  <div className="flex gap-1 mt-1">
                    {monster.elec_weakness > 0 && <Badge variant="outline">⚡</Badge>}
                    {monster.fire_weakness > 0 && <Badge variant="outline">🔥</Badge>}
                    {monster.ice_weakness > 0 && <Badge variant="outline">❄️</Badge>}
                    {monster.physics_weakness > 0 && <Badge variant="outline">⚔️</Badge>}
                    {monster.ether_weakness > 0 && <Badge variant="outline">✨</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buffs */}
        {floor.buffs.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Buffs</h4>
            <div className="space-y-2">
              {floor.buffs.map((buff, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{buff.title}</p>
                  <p className="text-muted-foreground whitespace-pre-line">{cleanBuffText(buff.text)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FloorDetailCard;

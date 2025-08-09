'use client'

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar as AvatarType, Buddy, FloorDetail } from "@/types/shiyu-defense"
import Image from "next/image"

interface TeamsOverviewProps {
  floors: FloorDetail[]
}

interface CharacterUsage extends AvatarType {
  usageCount: number;
  floors: number[];
}

interface BuddyUsage extends Buddy {
  usageCount: number;
  floors: number[];
}

export function TeamsOverview({ floors }: TeamsOverviewProps) {
  // Get unique characters across all floors
  const uniqueCharacters = new Map<number, CharacterUsage>();
  const uniqueBuddies = new Map<number, BuddyUsage>();

  if (floors) {
    floors.forEach(floor => {
      floor.node_1.avatars.forEach(avatar => {
        if (!uniqueCharacters.has(avatar.id)) {
          uniqueCharacters.set(avatar.id, {
            ...avatar,
            usageCount: 1,
            floors: [floor.layer_index]
          });
        } else {
          const char = uniqueCharacters.get(avatar.id);
          if (char) {
            char.usageCount++;
            char.floors.push(floor.layer_index);
          }
        }
      });

      const buddy = floor.node_1.buddy;
      if (buddy && !uniqueBuddies.has(buddy.id)) {
        uniqueBuddies.set(buddy.id, {
          ...buddy,
          usageCount: 1,
          floors: [floor.layer_index]
        });
      } else if (buddy) {
        const b = uniqueBuddies.get(buddy.id);
        if (b) {
          b.usageCount++;
          b.floors.push(floor.layer_index);
        }
      }
    });
  }

  const sortedCharacters = Array.from(uniqueCharacters.values())
    .sort((a, b) => b.usageCount - a.usageCount);

  const sortedBuddies = Array.from(uniqueBuddies.values())
    .sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Most Used Characters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {sortedCharacters.map(char => (
              <div key={char.id} className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <Image 
                    src={char.role_square_url || '/placeholder.png'}
                    alt={`Character ${char.id}`}
                    width={48}
                    height={48}
                    unoptimized
                  />
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">ID: {char.id}</h4>
                    {char.level && <Badge variant="outline">Lv.{char.level}</Badge>}
                    {char.rarity && <Badge>{char.rarity}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used in {char.usageCount} {char.usageCount === 1 ? 'floor' : 'floors'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {char.floors.map((floor: number) => (
                      <Badge key={floor} variant="secondary">F{floor}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Used Buddies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {sortedBuddies.map(buddy => (
              <div key={buddy.id} className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <Image 
                    src={buddy.bangboo_rectangle_url || '/placeholder.png'}
                    alt={`Buddy ${buddy.id}`}
                    width={48}
                    height={48}
                    unoptimized
                  />
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">ID: {buddy.id}</h4>
                    {buddy.level && <Badge variant="outline">Lv.{buddy.level}</Badge>}
                    {buddy.rarity && <Badge>{buddy.rarity}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used in {buddy.usageCount} {buddy.usageCount === 1 ? 'floor' : 'floors'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {buddy.floors.map((floor: number) => (
                      <Badge key={floor} variant="secondary">F{floor}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

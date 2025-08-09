'use client'

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cleanBuffText } from "@/lib/format-utils"
import { DeadlyAssaultRun } from "@/types/deadly-assault"
import Image from "next/image"

interface FloorDetailsProps {
  floor: DeadlyAssaultRun
}

export function FloorDetailCard({ floor }: FloorDetailsProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{floor.boss[0]?.name}: {floor.score}</h3>
            <p className="text-sm text-muted-foreground">Stars: {floor.star}/{floor.total_star}</p>
          </div>
          <Badge variant={floor.star === floor.total_star ? 'default' : 'secondary'}>
            {floor.star === floor.total_star ? 'Perfect' : 'Incomplete'}
          </Badge>
        </div>

        <Separator />

        {/* Battle Information */}
        <div>
          <h4 className="font-medium mb-2">Battle Information</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-medium">{floor.score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clear Date</p>
              <p className="font-medium">
                {`${floor.challenge_time.year}-${String(floor.challenge_time.month).padStart(2, '0')}-${String(floor.challenge_time.day).padStart(2, '0')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Team Composition */}
        <div>
          <h4 className="font-medium mb-2">Team Composition</h4>
          <div className="flex flex-wrap gap-4">
            {floor.avatar_list.map((avatar) => (
              <div key={avatar.id} className="flex items-center space-x-2">
                <Avatar>
                  <Image 
                    src={avatar.role_square_url} 
                    alt={`Character ${avatar.id}`}
                    width={40}
                    height={40}
                    unoptimized
                  />
                </Avatar>
                <div>
                  <p className="text-sm font-medium">ID: {avatar.id}</p>
                  <p className="text-xs text-muted-foreground">Lv.{avatar.level} • {avatar.rarity}</p>
                </div>
              </div>
            ))}
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

        {/* Enemies */}
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

        {/* Buffs */}
        {floor.buffer.length > 0 && (
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
        )}
      </div>
    </div>
  )
}

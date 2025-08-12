'use client'

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { DeadlyAssaultRun } from "@/types/deadly-assault"
import { TeamComposition } from "@/components/deadly-assault/team-composition"
import { BossesList } from "@/components/deadly-assault/bosses-list"
import { BuffsList } from "@/components/deadly-assault/buffs-list"

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

        <TeamComposition floor={floor} />
        <BossesList floor={floor} />
        <BuffsList floor={floor} />
      </div>
    </div>
  )
}

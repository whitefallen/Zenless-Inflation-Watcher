'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import type { ShiyuDefenseData } from '@/types/shiyu-defense'
import { getAgentInfoClient } from '@/lib/grade-utils'

interface TeamEntry {
  teamKey: string
  avatars: Array<{ id: number; role_square_url: string; element_type: number; rarity: string }>
  count: number
  ratings: string[]
  zones: string[]
  seasons: number
}

const ELEM_COLOR: Record<number, string> = {
  200: '#f5c842',
  201: '#60a5fa',
  202: '#f97316',
  203: '#a855f7',
  204: '#22c55e',
  205: '#ef4444',
}

const RATING_COLOR: Record<string, string> = {
  'S+': '#f5c842',
  'S': '#f5c842',
  'A': '#00d4ff',
  'B': '#a855f7',
  'C': '#f97316',
}

function ratingScore(r: string) {
  return r === 'S+' ? 4 : r === 'S' ? 3 : r === 'A' ? 2 : r === 'B' ? 1 : 0
}

export function HadalTeamsTable({ data }: { data: ShiyuDefenseData[] }) {
  const teams = useMemo(() => {
    const map = new Map<string, TeamEntry>()
    const seasonSet = new Map<string, Set<number>>()

    data.forEach((d, seasonIdx) => {
      for (const floor of d.data.all_floor_detail ?? []) {
        const avatars = floor.node_1?.avatars ?? []
        if (avatars.length === 0) continue

        const sorted = [...avatars].sort((a, b) => a.id - b.id)
        const teamKey = sorted.map(a => a.id).join('-')

        if (!map.has(teamKey)) {
          map.set(teamKey, {
            teamKey,
            avatars: sorted.map(a => ({
              id: a.id,
              role_square_url: a.role_square_url,
              element_type: a.element_type,
              rarity: a.rarity,
            })),
            count: 0,
            ratings: [],
            zones: [],
            seasons: 0,
          })
          seasonSet.set(teamKey, new Set())
        }

        const entry = map.get(teamKey)!
        entry.count++
        if (floor.rating) entry.ratings.push(floor.rating)
        if (floor.zone_name) entry.zones.push(floor.zone_name)
        seasonSet.get(teamKey)!.add(seasonIdx)
      }
    })

    for (const [key, entry] of map) {
      entry.seasons = seasonSet.get(key)!.size
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [data])

  const accent = '#00d4ff'
  const dim = 'rgba(0,212,255,0.04)'
  const border = 'rgba(0,212,255,0.15)'
  const clip = 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))'
  const clipSm = 'polygon(0 0,calc(100% - 3px) 0,100% 3px,100% 100%,3px 100%,0 calc(100% - 3px))'
  const clipAvatar = 'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))'

  if (teams.length === 0) {
    return (
      <div className="p-6 text-center text-[#6b7280] text-sm"
        style={{ background: dim, border: `1px solid ${border}`, clipPath: clip }}>
        No team data available.
      </div>
    )
  }

  return (
    <div style={{ background: dim, border: `1px solid ${border}`, clipPath: clip }}>
      <div className="p-4 border-b" style={{ borderColor: border }}>
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 inline-block" style={{ background: accent }} />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
            Team Compositions &mdash; {data.length} season{data.length !== 1 ? 's' : ''} &mdash; {teams.length} unique team{teams.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#6b7280] border-b"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-center">Used</th>
              <th className="px-4 py-2 text-center">Seasons</th>
              <th className="px-4 py-2 text-center">Best Rating</th>
              <th className="px-4 py-2 text-left">Floors</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => {
              const best = team.ratings.reduce(
                (b, r) => ratingScore(r) > ratingScore(b) ? r : b,
                team.ratings[0] || '?'
              )
              const uniqueZones = [...new Set(
                team.zones.map(z => z.replace('Fifth Floor - ', '').replace('Fourth Floor', 'F4'))
              )]

              return (
                <tr key={i} className="border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {team.avatars.map(a => {
                        const info = getAgentInfoClient(a.id, { role_square_url: a.role_square_url, rarity: a.rarity })
                        const elemColor = ELEM_COLOR[a.element_type] ?? '#6b7280'
                        return (
                          <div key={a.id} title={info.name}>
                            <div className="w-9 h-9 overflow-hidden"
                              style={{ border: `1px solid ${elemColor}55`, clipPath: clipAvatar }}>
                              <Image src={info.iconUrl} alt={info.name} width={36} height={36} unoptimized />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-black text-[#e8e0cc]">{team.count}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-[#6b7280] text-xs">{team.seasons}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-bold" style={{ color: RATING_COLOR[best] ?? '#6b7280' }}>
                      {best}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {uniqueZones.slice(0, 5).map((z, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 text-[#6b7280]"
                          style={{ border: '1px solid rgba(255,255,255,0.08)', clipPath: clipSm }}>
                          {z}
                        </span>
                      ))}
                      {uniqueZones.length > 5 && (
                        <span className="text-[9px] text-[#6b7280]">+{uniqueZones.length - 5}</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

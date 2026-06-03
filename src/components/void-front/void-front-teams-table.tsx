'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import type { VoidFrontData } from '@/types/void-front'
import { getAgentInfoClient } from '@/lib/grade-utils'

interface TeamEntry {
  teamKey: string
  avatars: Array<{ id: number; role_square_url: string; element_type: number; rarity: string }>
  count: number
  scores: number[]
  maxScore: number
  avgScore: number
  challengeNames: string[]
  seasons: number
}

const ELEM_COLOR: Record<number, string> = {
  200: '#e8e0cc',
  201: '#ff6b35',
  202: '#7dd3fc',
  203: '#fbbf24',
  205: '#c084fc',
}

export function VoidFrontTeamsTable({ data }: { data: VoidFrontData[] }) {
  const teams = useMemo(() => {
    const map = new Map<string, TeamEntry>()
    const seasonSet = new Map<string, Set<number>>()

    data.forEach((d, seasonIdx) => {
      for (const challenge of d.data.main_challenge_record_list ?? []) {
        const avatars = challenge.avatar_list ?? []
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
              rarity: String(a.rarity),
            })),
            count: 0,
            scores: [],
            maxScore: 0,
            avgScore: 0,
            challengeNames: [],
            seasons: 0,
          })
          seasonSet.set(teamKey, new Set())
        }

        const entry = map.get(teamKey)!
        entry.count++
        if (challenge.score > 0) entry.scores.push(challenge.score)
        if (challenge.name && !entry.challengeNames.includes(challenge.name)) {
          entry.challengeNames.push(challenge.name)
        }
        seasonSet.get(teamKey)!.add(seasonIdx)
      }
    })

    for (const [key, entry] of map) {
      entry.seasons = seasonSet.get(key)!.size
      if (entry.scores.length > 0) {
        entry.maxScore = Math.max(...entry.scores)
        entry.avgScore = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [data])

  const accent = '#a855f7'
  const dim = 'rgba(168,85,247,0.04)'
  const border = 'rgba(168,85,247,0.15)'
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
              <th className="px-4 py-2 text-center">Best Score</th>
              <th className="px-4 py-2 text-center">Avg Score</th>
              <th className="px-4 py-2 text-left">Challenges</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => (
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
                  <span className="font-bold" style={{ color: accent }}>
                    {team.maxScore > 0 ? team.maxScore.toLocaleString() : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-[#6b7280] text-xs">
                  {team.avgScore > 0 ? Math.round(team.avgScore).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {team.challengeNames.slice(0, 3).map((name, j) => (
                      <span key={j} className="text-[9px] px-1.5 py-0.5 text-[#6b7280]"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', clipPath: clipSm }}>
                        {name}
                      </span>
                    ))}
                    {team.challengeNames.length > 3 && (
                      <span className="text-[9px] text-[#6b7280]">+{team.challengeNames.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

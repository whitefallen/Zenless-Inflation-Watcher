'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { AgentEntry } from './types'

interface AgentFilterBarProps {
  agents: AgentEntry[]
  selected: number[]
  onChange: (next: number[]) => void
  accent?: string
}

export function AgentFilterBar({ agents, selected, onChange, accent = '#00d4ff' }: AgentFilterBarProps) {
  const [open, setOpen] = useState(false)
  if (agents.length === 0) return null

  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id))
    else onChange([...selected, id])
  }

  const visible = open ? agents : agents.slice(0, 16)

  return (
    <section
      className="p-4"
      style={{
        background: `${accent}0d`,
        border: `1px solid ${accent}33`,
        clipPath:
          'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}
    >
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: accent, opacity: 0.8 }}>
            Filter By Agent
          </div>
          <div className="text-[11px] text-[#6b7280] mt-0.5">
            {selected.length === 0
              ? 'Showing all seasons.'
              : `Showing seasons that include ${selected.length === 1 ? '1 agent' : `all ${selected.length} agents`}.`}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-[#6b7280] hover:text-[#e8e0cc] transition-colors"
            >
              Clear
            </button>
          )}
          {agents.length > 16 && (
            <button
              onClick={() => setOpen(o => !o)}
              className="text-[#6b7280] hover:text-[#e8e0cc] transition-colors"
            >
              {open ? 'Show less' : `Show all (${agents.length})`}
            </button>
          )}
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        {visible.map(a => {
          const isSelected = selected.includes(a.id)
          return (
            <li key={a.id}>
              <button
                onClick={() => toggle(a.id)}
                title={`Agent ${a.id} — ${a.seasonCount} season${a.seasonCount === 1 ? '' : 's'}`}
                className="relative flex items-center justify-center w-10 h-10 transition-all"
                style={{
                  border: `1.5px solid ${isSelected ? accent : '#1e2438'}`,
                  background: isSelected ? `${accent}26` : '#0d0f17',
                  boxShadow: isSelected ? `0 0 0 1px ${accent}55` : 'none',
                }}
              >
                {a.iconUrl ? (
                  <Image
                    src={a.iconUrl}
                    alt={`Agent ${a.id}`}
                    width={36}
                    height={36}
                    className="w-9 h-9"
                    unoptimized
                  />
                ) : (
                  <span className="text-[10px] text-[#6b7280]">{a.id}</span>
                )}
                <span
                  className="absolute -bottom-1 -right-1 text-[8px] font-bold tabular-nums px-1 leading-tight bg-[#0d0f17] text-[#6b7280]"
                  style={{ border: `1px solid ${isSelected ? accent : '#1e2438'}` }}
                >
                  {a.seasonCount}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

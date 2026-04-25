import React from 'react'

interface StatItem {
  label: string
  value: string | number
  accent?: 'gold' | 'cyan' | 'purple' | 'orange'
}

interface PageHeaderProps {
  code: string
  title: string
  subtitle: string
  description?: string
  stats?: StatItem[]
  accent?: 'gold' | 'cyan' | 'purple'
}

const accentConfig = {
  gold: {
    color: '#f5c842',
    dimColor: 'rgba(245,200,66,0.08)',
    border: 'rgba(245,200,66,0.2)',
    glow: '0 0 20px rgba(245,200,66,0.15)',
  },
  cyan: {
    color: '#00d4ff',
    dimColor: 'rgba(0,212,255,0.06)',
    border: 'rgba(0,212,255,0.2)',
    glow: '0 0 20px rgba(0,212,255,0.12)',
  },
  purple: {
    color: '#a855f7',
    dimColor: 'rgba(168,85,247,0.06)',
    border: 'rgba(168,85,247,0.2)',
    glow: '0 0 20px rgba(168,85,247,0.12)',
  },
}

const statAccentConfig: Record<string, { color: string }> = {
  gold: { color: '#f5c842' },
  cyan: { color: '#00d4ff' },
  purple: { color: '#a855f7' },
  orange: { color: '#ff6b35' },
}

export function PageHeader({
  code,
  title,
  subtitle,
  description,
  stats,
  accent = 'gold',
}: PageHeaderProps) {
  const cfg = accentConfig[accent]

  return (
    <div className="relative overflow-hidden" style={{ background: cfg.dimColor }}>
      {/* Top border accent */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />

      <div className="px-6 py-8 flex flex-col gap-5">
        {/* Code + subtitle row */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-black tracking-[0.25em] px-2 py-0.5 shrink-0"
            style={{
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
            }}
          >
            {code}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: cfg.color, opacity: 0.65 }}>
            {subtitle}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1] text-[#e8e0cc]">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-sm text-[#6b7280] max-w-xl leading-relaxed">{description}</p>
        )}

        {/* Stats row */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#1e2438]">
            {stats.map((stat) => {
              const statColor = stat.accent ? statAccentConfig[stat.accent]?.color ?? cfg.color : cfg.color
              return (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6b7280]">
                    {stat.label}
                  </span>
                  <span className="text-lg font-black" style={{ color: statColor }}>
                    {stat.value}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom border */}
      <div className="h-px w-full" style={{ background: cfg.border }} />
    </div>
  )
}

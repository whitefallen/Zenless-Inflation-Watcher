import React from 'react'

interface StatItem {
  label: string
  value: string | number
  accent?: 'gold' | 'cyan' | 'red' | 'orange' | 'purple'
}

interface PageHeaderProps {
  code: string
  title: string
  subtitle: string
  description?: string
  stats?: StatItem[]
  accent?: 'gold' | 'cyan' | 'red' | 'purple'
}

const accentConfig = {
  gold: {
    color: '#ffd400',
    border: '#5f5518',
    tint: 'rgba(255, 212, 0, 0.06)',
  },
  cyan: {
    color: '#2be0ff',
    border: '#1b5662',
    tint: 'rgba(43, 224, 255, 0.06)',
  },
  red: {
    color: '#ff3d2e',
    border: '#69312c',
    tint: 'rgba(255, 61, 46, 0.06)',
  },
  purple: {
    color: '#2be0ff',
    border: '#1b5662',
    tint: 'rgba(43, 224, 255, 0.06)',
  },
}

const statAccentConfig: Record<string, { color: string }> = {
  gold: { color: '#ffd400' },
  cyan: { color: '#2be0ff' },
  red: { color: '#ff3d2e' },
  purple: { color: '#2be0ff' },
  orange: { color: '#ff3d2e' },
}

function splitTitle(title: string) {
  const parts = title.trim().split(/\s+/)
  if (parts.length < 2) return { top: title, bottom: '' }
  return {
    top: parts.slice(0, -1).join(' '),
    bottom: parts[parts.length - 1],
  }
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
  const titleParts = splitTitle(title)

  return (
    <section
      className="relative overflow-hidden border border-[#3a3a42] bg-[#0f0f12]"
      style={{ boxShadow: '0 24px 70px rgba(0,0,0,0.28)' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] zzz-grid-bg" />
      <div className="relative grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-[#3a3a42] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-3 w-16" style={{ background: cfg.color }} />
            <span className="text-[0.72rem] font-semibold tracking-normal uppercase" style={{ color: cfg.color }}>
              Sector {code}
            </span>
          </div>

          <div className="space-y-3">
            <p className="zzz-kicker">{subtitle}</p>
            <h1 className="font-display text-5xl leading-[0.9] tracking-normal text-[#f4f4f0] sm:text-6xl">
              {titleParts.top || title}
              {titleParts.bottom && (
                <>
                  <br />
                  <span className="text-transparent" style={{ WebkitTextStroke: `2px ${cfg.color}` }}>
                    {titleParts.bottom}
                  </span>
                </>
              )}
            </h1>
            {description && (
              <p className="max-w-2xl text-base leading-relaxed text-[#a1a3ad]">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10" style={{ background: cfg.tint }}>
          <div>
            <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">
              Current log
            </div>
            <div className="mt-2 font-display text-2xl tracking-normal text-[#f4f4f0]">
              Patrol report online
            </div>
          </div>

          {stats && stats.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {stats.map((stat) => {
                const statColor = stat.accent ? statAccentConfig[stat.accent]?.color ?? cfg.color : cfg.color
                return (
                  <div key={stat.label} className="border border-[#3a3a42] bg-[#131316] p-3">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-normal text-[#8f919c]">
                      {stat.label}
                    </div>
                    <div className="mt-2 font-display text-2xl tracking-normal" style={{ color: statColor }}>
                      {stat.value}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="h-[3px] w-full" style={{ background: cfg.color }} />
    </section>
  )
}

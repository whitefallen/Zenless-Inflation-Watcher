import Link from "next/link"
import { getAllDeadlyAssaultData } from "@/lib/deadly-assault"
import { getAllShiyuDefenseData } from "@/lib/shiyu-defense"
import { getAllVoidFrontData } from "@/lib/void-front"
import { InflationTracker } from "@/components/analytics/inflation-tracker"
import { buildDaInflation, buildHadalInflation, buildVfInflation } from "@/lib/analytics-extractors"

const modes = [
  {
    href: "/deadly-assault",
    code: "01",
    title: "Deadly Assault",
    subtitle: "Boss Challenge",
    description: "Track scores, star ratings, and boss completion stats across every season.",
    stats: ["Score Progression", "Boss Difficulty", "Team Performance"],
    accent: "#f5c842",
    accentDim: "rgba(245, 200, 66, 0.08)",
    accentBorder: "rgba(245, 200, 66, 0.2)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <path d="M20 4 L36 32 H4 Z" stroke="#f5c842" strokeWidth="1.5" fill="rgba(245,200,66,0.08)" />
        <path d="M20 12 L28 28 H12 Z" fill="#f5c842" opacity="0.4" />
        <circle cx="20" cy="20" r="2" fill="#f5c842" />
      </svg>
    ),
  },
  {
    href: "/shiyu-defense",
    code: "02",
    title: "Shiyu Defense",
    subtitle: "Floor Gauntlet",
    description: "Analyze floor completions, Hadal Blacksite scores, and team compositions over time.",
    stats: ["Floor Analytics", "Hadal Score", "Character Usage"],
    accent: "#00d4ff",
    accentDim: "rgba(0, 212, 255, 0.06)",
    accentBorder: "rgba(0, 212, 255, 0.2)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect x="6" y="6" width="28" height="28" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.06)" />
        <rect x="12" y="12" width="16" height="16" stroke="#00d4ff" strokeWidth="1" fill="rgba(0,212,255,0.1)" />
        <rect x="17" y="17" width="6" height="6" fill="#00d4ff" opacity="0.7" />
      </svg>
    ),
  },
  {
    href: "/void-front",
    code: "03",
    title: "Void Front",
    subtitle: "Combat Ops",
    description: "Review challenge progress, team compositions, and boss battle outcomes.",
    stats: ["Challenge Data", "Team Builds", "Boss Battles"],
    accent: "#a855f7",
    accentDim: "rgba(168, 85, 247, 0.06)",
    accentBorder: "rgba(168, 85, 247, 0.2)",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <polygon points="20,4 36,14 36,26 20,36 4,26 4,14" stroke="#a855f7" strokeWidth="1.5" fill="rgba(168,85,247,0.06)" />
        <polygon points="20,10 30,17 30,23 20,30 10,23 10,17" fill="#a855f7" opacity="0.2" />
        <circle cx="20" cy="20" r="3" fill="#a855f7" opacity="0.8" />
      </svg>
    ),
  },
]

export default async function Home() {
  const [daData, shiyuData, vfData] = await Promise.all([
    getAllDeadlyAssaultData().catch(() => []),
    getAllShiyuDefenseData().catch(() => []),
    getAllVoidFrontData().catch(() => []),
  ])

  const inflationSeries = [
    { name: 'Deadly Assault', color: '#f5c842', points: buildDaInflation(daData) },
    { name: 'Hadal Blacksite', color: '#00d4ff', points: buildHadalInflation(shiyuData) },
    { name: 'Void Front', color: '#a855f7', points: buildVfInflation(vfData) },
  ].filter(s => s.points.length > 0)

  return (
    <div className="zzz-hero-bg min-h-[calc(100vh-4rem)] relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#f5c842 1px, transparent 1px), linear-gradient(90deg, #f5c842 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-5xl mx-auto py-16 px-4 flex flex-col gap-14">
        {/* Hero */}
        <div className="flex flex-col gap-4">
          <div className="zzz-section-label">Battle Performance Dashboard</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
            <span className="zzz-heading">Battle Records</span>
            <br />
            <span className="text-[#e8e0cc]/40 text-2xl md:text-3xl font-light tracking-widest">ZENLESS ZONE ZERO</span>
          </h1>
          <p className="text-[#6b7280] text-base max-w-xl leading-relaxed">
            Deep analytics for your ZZZ combat performance — scores, trends, team compositions,
            and efficiency metrics across all three endgame modes.
          </p>
          <div className="zzz-divider w-64 mt-2" />
        </div>

        {/* Mode cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {modes.map((mode) => (
            <Link key={mode.href} href={mode.href} className="group block">
              <div
                className="relative h-full p-5 flex flex-col gap-4 transition-all duration-300"
                style={{
                  background: mode.accentDim,
                  border: `1px solid ${mode.accentBorder}`,
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${mode.accentBorder} 0%, transparent 70%)`,
                  }}
                />

                <div className="flex items-start justify-between relative">
                  {mode.icon}
                  <span
                    className="text-[10px] font-black tracking-[0.2em] px-1.5 py-0.5"
                    style={{
                      color: mode.accent,
                      border: `1px solid ${mode.accentBorder}`,
                      clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                    }}
                  >
                    {mode.code}
                  </span>
                </div>

                <div className="relative flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: mode.accent, opacity: 0.7 }}>
                    {mode.subtitle}
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-[#e8e0cc] group-hover:text-white transition-colors">
                    {mode.title}
                  </h2>
                  <p className="text-xs text-[#6b7280] leading-relaxed mt-1">{mode.description}</p>
                </div>

                <div className="relative flex flex-col gap-1.5 mt-auto pt-3 border-t" style={{ borderColor: mode.accentBorder }}>
                  {mode.stats.map((stat) => (
                    <div key={stat} className="flex items-center gap-2 text-[11px] text-[#6b7280]">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: mode.accent, opacity: 0.7 }} />
                      {stat}
                    </div>
                  ))}
                </div>

                <div
                  className="relative flex items-center justify-between text-[11px] font-bold tracking-wider uppercase transition-colors"
                  style={{ color: mode.accent }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">View Analytics</span>
                  <span className="ml-auto group-hover:translate-x-1 transition-transform duration-200">&#8594;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Inflation tracker — cross-mode score% over time */}
        {inflationSeries.length > 0 && <InflationTracker series={inflationSeries} />}

        {/* Footer info row */}
        <div className="flex flex-wrap gap-6 items-center pt-4 border-t border-[#1e2438]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6b7280]">Data Source</span>
            <span className="text-xs text-[#e8e0cc]/60">Local JSON · Auto-updated</span>
          </div>
          <div className="w-px h-6 bg-[#1e2438]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6b7280]">Modes Tracked</span>
            <span className="text-xs text-[#e8e0cc]/60">3 Endgame Sectors</span>
          </div>
          <div className="w-px h-6 bg-[#1e2438]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6b7280]">Version</span>
            <span className="text-xs text-[#00d4ff]/60">Revamp · 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}

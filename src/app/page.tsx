import Link from "next/link"
import { InflationTracker } from "@/components/analytics/inflation-tracker"
import { buildDaInflation, buildHadalInflation, buildVfInflation } from "@/lib/analytics-extractors"
import { getAllDeadlyAssaultData } from "@/lib/deadly-assault"
import { getAllShiyuDefenseData } from "@/lib/shiyu-defense"
import { getAllVoidFrontData } from "@/lib/void-front"

const modes = [
  {
    href: "/shiyu-defense",
    titleTop: "SHIYU",
    titleBottom: "DEFENSE",
    subtitle: "Floor gauntlet analytics and Hadal Blacksite tracking.",
    stats: ["Floor analytics", "Hadal score", "Character usage"],
    accent: "#ffd400",
    accentBorder: "#5f5518",
    accentTint: "rgba(255, 212, 0, 0.06)",
  },
  {
    href: "/void-front",
    titleTop: "VOID",
    titleBottom: "FRONT",
    subtitle: "Challenge progress, squad review, and boss encounter history.",
    stats: ["Challenge data", "Team builds", "Boss battles"],
    accent: "#2be0ff",
    accentBorder: "#1b5662",
    accentTint: "rgba(43, 224, 255, 0.06)",
  },
  {
    href: "/deadly-assault",
    titleTop: "DEADLY",
    titleBottom: "ASSAULT",
    subtitle: "Boss score tracking, performance trends, and clear-speed pressure.",
    stats: ["Score progression", "Boss difficulty", "Team performance"],
    accent: "#ff3d2e",
    accentBorder: "#69312c",
    accentTint: "rgba(255, 61, 46, 0.06)",
  },
]

export default async function Home() {
  const [daData, shiyuData, vfData] = await Promise.all([
    getAllDeadlyAssaultData().catch(() => []),
    getAllShiyuDefenseData().catch(() => []),
    getAllVoidFrontData().catch(() => []),
  ])

  const inflationSeries = [
    { name: "Deadly Assault", color: "#ff3d2e", points: buildDaInflation(daData) },
    { name: "Hadal Blacksite", color: "#ffd400", points: buildHadalInflation(shiyuData) },
    { name: "Void Front", color: "#2be0ff", points: buildVfInflation(vfData) },
  ].filter((series) => series.points.length > 0)

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden zzz-hero-bg">
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] zzz-grid-bg" />

      <div className="relative flex flex-col gap-10 py-8 sm:gap-12 sm:py-12">
        <section className="border border-[#3a3a42] bg-[#0f0f12]">
          <div className="grid gap-0 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="border-b border-[#3a3a42] p-6 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
              <div className="mb-5 inline-flex items-center gap-3">
                <span className="h-3 w-16 bg-[#ffd400]" />
                <span className="zzz-section-label">Inflation Watcher</span>
              </div>
              <div className="space-y-3">
                <p className="zzz-kicker">Zenless Zone Zero / Patrol Log</p>
                <h1 className="font-display text-5xl leading-[0.9] tracking-normal text-[#f4f4f0] sm:text-6xl lg:text-7xl">
                  BATTLE
                  <br />
                  RECORDS
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-[#a1a3ad] sm:text-lg">
                  A redesigned operations board for reading your endgame history at a glance:
                  Shiyu Defense, Void Front, and Deadly Assault in one strong visual system.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 xl:p-10">
              <div className="space-y-3">
                <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">
                  Current coverage
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-[#3a3a42] bg-[#131316] p-3">
                    <div className="font-display text-3xl tracking-normal text-[#ffd400]">3</div>
                    <div className="text-xs uppercase tracking-normal text-[#8f919c]">Modes</div>
                  </div>
                  <div className="border border-[#3a3a42] bg-[#131316] p-3">
                    <div className="font-display text-3xl tracking-normal text-[#2be0ff]">{inflationSeries.length}</div>
                    <div className="text-xs uppercase tracking-normal text-[#8f919c]">Trend lines</div>
                  </div>
                  <div className="border border-[#3a3a42] bg-[#131316] p-3">
                    <div className="font-display text-3xl tracking-normal text-[#ff3d2e]">24/7</div>
                    <div className="text-xs uppercase tracking-normal text-[#8f919c]">Local log</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#3a3a42] pt-5">
                <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">
                  Reading mode
                </div>
                <div className="mt-2 font-display text-2xl leading-tight tracking-normal text-[#f4f4f0]">
                  Editorial layout. Hard contrast. Fast scan.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {modes.map((mode) => (
            <Link key={mode.href} href={mode.href} className="group block">
              <div
                className="relative flex h-full min-h-[25rem] flex-col overflow-hidden border p-6 sm:p-7"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0)), ${mode.accentTint}`,
                  borderColor: mode.accentBorder,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
                }}
              >
                <div className="mb-8 h-3 w-16 shrink-0" style={{ background: mode.accent }} />

                <div className="space-y-1">
                  <div className="font-display text-4xl leading-[0.88] tracking-normal text-[#f4f4f0] sm:text-5xl">
                    {mode.titleTop}
                  </div>
                  <div
                    className="font-display text-4xl leading-[0.88] tracking-normal text-transparent sm:text-5xl"
                    style={{ WebkitTextStroke: `2px ${mode.accent}` }}
                  >
                    {mode.titleBottom}
                  </div>
                </div>

                <div className="mt-6 max-w-sm text-sm leading-relaxed text-[#a1a3ad] sm:text-base">
                  {mode.subtitle}
                </div>

                <div className="mt-auto space-y-3 border-t pt-5" style={{ borderColor: mode.accentBorder }}>
                  {mode.stats.map((stat) => (
                    <div key={stat} className="flex items-center gap-3 text-sm uppercase tracking-normal text-[#c8cad0]">
                      <span className="h-2 w-2 shrink-0" style={{ background: mode.accent }} />
                      {stat}
                    </div>
                  ))}
                </div>

                <div
                  className="mt-8 flex items-center justify-between border-t pt-4 text-sm uppercase tracking-normal"
                  style={{ borderColor: mode.accentBorder, color: mode.accent }}
                >
                  <span>Open board</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">-&gt;</span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {inflationSeries.length > 0 && <InflationTracker series={inflationSeries} />}

        <section className="grid gap-4 border-t border-[#2b2b33] pt-6 sm:grid-cols-3">
          <div className="border border-[#2b2b33] bg-[#131316] p-4">
            <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">Data Source</div>
            <div className="mt-2 font-display text-xl tracking-normal text-[#f4f4f0]">Local JSON</div>
            <div className="text-sm text-[#8f919c]">Auto-updated records from your archive.</div>
          </div>
          <div className="border border-[#2b2b33] bg-[#131316] p-4">
            <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">Modes Tracked</div>
            <div className="mt-2 font-display text-xl tracking-normal text-[#f4f4f0]">3 Endgame Sectors</div>
            <div className="text-sm text-[#8f919c]">Shiyu Defense, Void Front, and Deadly Assault.</div>
          </div>
          <div className="border border-[#2b2b33] bg-[#131316] p-4">
            <div className="text-[0.72rem] font-semibold tracking-normal uppercase text-[#8f919c]">Visual Pass</div>
            <div className="mt-2 font-display text-xl tracking-normal text-[#f4f4f0]">Patrol Log 2026</div>
            <div className="text-sm text-[#8f919c]">Reference-matched shell, cards, and tracker styling.</div>
          </div>
        </section>
      </div>
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'

interface Stat {
  label: string
  value: string | number
}

interface ShareCardProps {
  mode: string
  title: string
  stats: Stat[]
  accent?: string
}

export function ShareCard({ mode, title, stats, accent = '#00d4ff' }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const download = async () => {
    if (!cardRef.current) return
    setBusy(true)
    setErr(null)
    try {
      // Dynamic import — html-to-image uses canvas/Image APIs that aren't safe to load on the server
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0d0f17',
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `zzz-${mode.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to export image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      className="p-5"
      style={{
        background: `${accent}0d`,
        border: `1px solid ${accent}33`,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: accent, opacity: 0.8 }}
          >
            Share Card
          </div>
          <h3 className="text-lg font-black text-[#e8e0cc]">Latest run · downloadable PNG</h3>
        </div>
        <button
          onClick={download}
          disabled={busy}
          className="text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 transition-all disabled:opacity-50"
          style={{
            color: accent,
            border: `1px solid ${accent}55`,
            background: `${accent}1a`,
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}
        >
          {busy ? 'Rendering…' : 'Download PNG'}
        </button>
      </div>

      {err && (
        <div className="text-[11px] text-[#ef4444] mb-3">Couldn&apos;t export image: {err}</div>
      )}

      {/* The card itself — kept at fixed pixel dims so the exported PNG is consistent */}
      <div
        ref={cardRef}
        className="relative mx-auto"
        style={{
          width: 600,
          maxWidth: '100%',
          aspectRatio: '1200 / 630',
          background: 'linear-gradient(135deg, #0d0f17 0%, #14182a 100%)',
          border: `1px solid ${accent}55`,
          padding: 32,
          clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 100%, ${accent}33 0%, transparent 70%)`,
          }}
        />
        <div className="relative h-full flex flex-col justify-between">
          <div>
            <div
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1"
              style={{ color: accent }}
            >
              ZZZ · {mode}
            </div>
            <h2
              className="font-black text-[#e8e0cc] leading-tight"
              style={{ fontSize: 'clamp(20px, 4vw, 32px)' }}
            >
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)` }}>
            {stats.map((s, i) => (
              <div
                key={`${s.label}-${i}`}
                className="px-3 py-2 bg-[#0d0f17]/70"
                style={{ border: `1px solid ${accent}33` }}
              >
                <div
                  className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1 text-[#6b7280]"
                >
                  {s.label}
                </div>
                <div className="text-base font-black text-[#e8e0cc] leading-tight">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between text-[9px] font-bold tracking-[0.2em] uppercase text-[#6b7280]">
            <span>zenless · battle records</span>
            <span style={{ color: accent }}>{new Date().toISOString().slice(0, 10)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

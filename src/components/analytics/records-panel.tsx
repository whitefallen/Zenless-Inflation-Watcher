'use client'

export interface RecordItem {
  label: string
  value: string | number
  sublabel?: string
}

interface RecordsPanelProps {
  title: string
  records: RecordItem[]
  accent?: string
}

export function RecordsPanel({ title, records, accent = '#00d4ff' }: RecordsPanelProps) {
  if (records.length === 0) return null

  const accentDim = `${accent}1a`
  const accentBorder = `${accent}33`

  return (
    <section
      className="p-5"
      style={{
        background: accentDim,
        border: `1px solid ${accentBorder}`,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      <div
        className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4"
        style={{ color: accent, opacity: 0.8 }}
      >
        {title}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {records.map((r, i) => (
          <div
            key={`${r.label}-${i}`}
            className="p-3 bg-[#0d0f17] border border-[#1e2438]"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            }}
          >
            <div className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#6b7280] mb-1">
              {r.label}
            </div>
            <div className="text-lg font-black text-[#e8e0cc] leading-tight">{r.value}</div>
            {r.sublabel && (
              <div className="text-[10px] text-[#6b7280] mt-1 truncate" title={r.sublabel}>
                {r.sublabel}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

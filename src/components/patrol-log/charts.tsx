'use client';
import React, { useRef, useState, useEffect } from 'react';

export function useChartH(desktop: number, mobile = 160): number {
  const [h, setH] = useState(desktop);
  useEffect(() => {
    const fn = () => setH(window.innerWidth < 768 ? mobile : desktop);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [desktop, mobile]);
  return h;
}

function useContainerWidth(fallback = 800) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

interface TooltipState {
  i: number; x: number; y: number;
  d: Record<string, unknown>;
}

export function AreaLineChart({
  data, height = 240, color = 'var(--tape)', yKey = 'score', yLabel = '',
  formatY = (v: number) => String(v), invertY = false,
}: {
  data: Array<Record<string, unknown>>;
  height?: number;
  color?: string;
  yKey?: string;
  yLabel?: string;
  formatY?: (v: number) => string;
  invertY?: boolean;
}) {
  const [ref, w] = useContainerWidth();
  const [tip, setTip] = useState<TooltipState | null>(null);

  if (!data || data.length === 0) return <div ref={ref} style={{ height }} />;

  const padL = 48, padR = 24, padT = 16, padB = 32;
  const W = Math.max(w, 200), H = height;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const ys = data.map(d => (d[yKey] as number) || 0);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const pad = Math.max((yMax - yMin) * 0.15, 1);
  const lo = Math.max(0, yMin - pad), hi = yMax + pad;

  const xAt = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  // invertY: low values plot high (good) — e.g. rank_percent where lower % = better
  const yAt = invertY
    ? (v: number) => padT + ((v - lo) / (hi - lo)) * innerH
    : (v: number) => padT + innerH - ((v - lo) / (hi - lo)) * innerH;
  const ticks = 4;
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => lo + (hi - lo) * (i / ticks));
  const points = data.map((d, i) => `${xAt(i)},${yAt((d[yKey] as number) || 0)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${xAt(data.length - 1)},${padT + innerH} L ${xAt(0)},${padT + innerH} Z`;
  const gradId = `gradlc${color.replace(/\W/g, '') || 'x'}`;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridY.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--line)" strokeDasharray="2 4" />
            <text x={padL - 8} y={yAt(v) + 4} fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-dim)" textAnchor="end">{formatY(Math.round(v))}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={xAt(i)} y={H - padB + 18} fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-dim)" textAnchor="middle">{d.label as string}</text>
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={xAt(i)} cy={yAt((d[yKey] as number) || 0)}
              r={tip?.i === i ? 6 : 3.5}
              fill={color} stroke="#000" strokeWidth="1.5"
              onMouseEnter={() => setTip({ i, x: xAt(i), y: yAt((d[yKey] as number) || 0), d })}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
            />
            <rect x={xAt(i) - 15} y={padT} width="30" height={innerH} fill="transparent"
              onMouseEnter={() => setTip({ i, x: xAt(i), y: yAt((d[yKey] as number) || 0), d })}
              onMouseLeave={() => setTip(null)} />
          </g>
        ))}
      </svg>
      {tip && (
        <div className="chart-tooltip" style={{ left: tip.x, top: tip.y - 12 }}>
          <div className="hairline" style={{ color: 'var(--ink)' }}>{tip.d.label as string}</div>
          <div className="display" style={{ fontSize: 18, color }}>{formatY(tip.d[yKey] as number)}{yLabel}</div>
          {tip.d.sub != null && <div className="hairline">{String(tip.d.sub)}</div>}
        </div>
      )}
    </div>
  );
}

export function MultiLineChart({
  data, series, height = 240, formatY = (v: number) => String(v),
}: {
  data: Array<Record<string, unknown>>;
  series: Array<{ key: string; name: string; color: string }>;
  height?: number;
  formatY?: (v: number) => string;
}) {
  const [ref, w] = useContainerWidth();
  const [tip, setTip] = useState<TooltipState | null>(null);

  if (!data || data.length === 0) return <div ref={ref} style={{ height }} />;

  const padL = 48, padR = 24, padT = 16, padB = 32;
  const W = Math.max(w, 200), H = height;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const allYs = data.flatMap(d => series.map(s => d[s.key] as number).filter(v => v != null));
  const yMin = Math.min(...allYs), yMax = Math.max(...allYs);
  const pad = Math.max((yMax - yMin) * 0.15, 1);
  const lo = Math.max(0, yMin - pad), hi = yMax + pad;

  const xAt = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v: number) => padT + innerH - ((v - lo) / (hi - lo)) * innerH;
  const ticks = 4;
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => lo + (hi - lo) * (i / ticks));

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {gridY.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--line)" strokeDasharray="2 4" />
            <text x={padL - 8} y={yAt(v) + 4} fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-dim)" textAnchor="end">{formatY(Math.round(v))}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={xAt(i)} y={H - padB + 18} fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-dim)" textAnchor="middle">{d.label as string}</text>
        ))}
        {series.map(s => {
          const pts = data.map((d, i) => d[s.key] != null ? `${xAt(i)},${yAt(d[s.key] as number)}` : null).filter(Boolean) as string[];
          if (pts.length < 1) return null;
          return (
            <g key={s.key}>
              <path d={`M ${pts.join(' L ')}`} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {data.map((d, i) => d[s.key] != null && (
                <circle key={i} cx={xAt(i)} cy={yAt(d[s.key] as number)} r={tip?.i === i ? 5 : 3} fill={s.color} stroke="#000" strokeWidth="1.5" />
              ))}
            </g>
          );
        })}
        {data.map((d, i) => (
          <rect key={i} x={xAt(i) - 15} y={padT} width="30" height={innerH} fill="transparent"
            onMouseEnter={() => setTip({ i, x: xAt(i), y: padT + 10, d })}
            onMouseLeave={() => setTip(null)} />
        ))}
      </svg>
      {tip && (
        <div className="chart-tooltip" style={{ left: tip.x, top: tip.y }}>
          <div className="hairline" style={{ color: 'var(--ink)' }}>{tip.d.label as string}</div>
          {series.map(s => tip.d[s.key] != null && (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 10, height: 2, background: s.color, display: 'inline-block' }} />
              <span style={{ color: 'var(--ink-dim)' }}>{s.name}:</span>
              <span className="mono tabular" style={{ color: s.color, fontWeight: 700 }}>{formatY(tip.d[s.key] as number)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({
  data, height = 240, color = 'var(--tape)', formatY = (v: number) => String(v),
}: {
  data: Array<{ label: string; value: number; sub?: string; sub2?: string; color?: string }>;
  height?: number;
  color?: string;
  formatY?: (v: number) => string;
}) {
  const [ref, w] = useContainerWidth();
  const [tip, setTip] = useState<TooltipState | null>(null);

  if (!data || data.length === 0) return <div ref={ref} style={{ height }} />;

  const padL = 48, padR = 24, padT = 16, padB = 36;
  const W = Math.max(w, 200), H = height;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = Math.max(...data.map(d => d.value));
  const barW = innerW / data.length * 0.7;
  const gap = innerW / data.length * 0.3;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke="var(--line)" />
        {data.map((d, i) => {
          const x = padL + i * (barW + gap) + gap / 2;
          const h = (d.value / max) * innerH;
          const y = padT + innerH - h;
          return (
            <g key={i}
              onMouseEnter={() => setTip({ i, x: x + barW / 2, y: y - 8, d: d as Record<string, unknown> })}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x} y={y} width={barW} height={h} fill={d.color || color} opacity={tip?.i === i ? 1 : 0.85} />
              <text x={x + barW / 2} y={H - padB + 16} fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-dim)" textAnchor="middle">{d.label}</text>
              <text x={x + barW / 2} y={H - padB + 30} fontSize="9" fontFamily="JetBrains Mono" fill="var(--ink-faint)" textAnchor="middle">{d.sub || ''}</text>
            </g>
          );
        })}
      </svg>
      {tip && (
        <div className="chart-tooltip" style={{ left: tip.x, top: tip.y }}>
          <div className="hairline" style={{ color: 'var(--ink)' }}>{(tip.d as { label: string }).label}</div>
          <div className="display" style={{ fontSize: 18, color: (tip.d as { color?: string }).color || color }}>{formatY((tip.d as { value: number }).value)}</div>
          {(tip.d as { sub2?: string }).sub2 && <div className="hairline">{(tip.d as { sub2: string }).sub2}</div>}
        </div>
      )}
    </div>
  );
}

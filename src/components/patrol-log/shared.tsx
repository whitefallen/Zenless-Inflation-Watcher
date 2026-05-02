'use client';
import React, { useState } from 'react';
import type { AvatarInfo, TimeStamp } from './types';

export const ELEMENT: Record<number, { name: string; color: string; short: string }> = {
  200: { name: 'Physical', color: '#E5E5E5', short: 'PHY' },
  201: { name: 'Fire',     color: '#FF6A2C', short: 'FIR' },
  202: { name: 'Ice',      color: '#98EFF0', short: 'ICE' },
  203: { name: 'Electric', color: '#FFE338', short: 'ELE' },
  205: { name: 'Ether',    color: '#FF7AC6', short: 'ETH' },
  206: { name: 'Frost',    color: '#BFE9FF', short: 'FRO' },
  207: { name: 'Auric Ink',color: '#FFB85C', short: 'AUR' },
};
export const PROFESSION: Record<number, string> = {
  1: 'Attack', 2: 'Stun', 3: 'Anomaly', 4: 'Support', 5: 'Defense', 6: 'Rupture',
};

export function fmtNum(n?: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}
export function fmtTsShort(ts?: TimeStamp | null): string {
  if (!ts) return '—';
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${months[ts.month - 1]} ${ts.day}`;
}
export function fmtDateRange(a?: TimeStamp | null, b?: TimeStamp | null): string {
  if (!a || !b) return '—';
  return `${fmtTsShort(a)} – ${fmtTsShort(b)}`;
}
export function tsToDate(ts?: TimeStamp | null): Date | null {
  if (!ts) return null;
  return new Date(ts.year, ts.month - 1, ts.day, ts.hour || 0, ts.minute || 0);
}
export function ratingClass(r?: string | null): string {
  if (!r) return 'b';
  if (r === 'S+') return 'sp';
  if (r === 'S') return 's';
  if (r === 'A') return 'a';
  return 'b';
}
export function elementInfo(id: number) { return ELEMENT[id] || { name: '—', color: '#888', short: '?' }; }
export function professionName(id: number): string { return PROFESSION[id] || '—'; }

export function Agent({ a, size = 'md', onClick }: { a: AvatarInfo; size?: 'sm'|'md'|'lg'|'xl'; onClick?: (a: AvatarInfo) => void }) {
  const el = elementInfo(a.element);
  const rarCls = a.rarity === 'S' ? 's' : a.rarity === 'A' ? 'a' : '';
  const sizeCls = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : '';
  return (
    <div
      className={`agent ${sizeCls} ${rarCls}`}
      onClick={onClick ? () => onClick(a) : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title={`Agent ${a.id} · ${el.name} · ${professionName(a.profession)}`}
    >
      <div className="badge-element" style={{ background: el.color }} />
      {a.url && <img src={a.url} alt="" loading="lazy" decoding="async" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      {a.rank > 0 && <div className="badge-rank">M{a.rank}</div>}
    </div>
  );
}

export function Team({ avatars, size = 'md', onClick }: { avatars: AvatarInfo[]; size?: 'sm'|'md'|'lg'; onClick?: (a: AvatarInfo) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {(avatars || []).map((a, i) => <Agent key={i} a={a} size={size} onClick={onClick} />)}
    </div>
  );
}

export function Sticker({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default'|'red'|'cyan'|'dark' }) {
  const cls = variant === 'red' ? 'red' : variant === 'cyan' ? 'cyan' : variant === 'dark' ? 'dark' : '';
  return <span className={`sticker ${cls}`}>{children}</span>;
}

export function Stat({ label, value, sub, large, accent }: {
  label: string; value: React.ReactNode; sub?: string; large?: boolean; accent?: boolean;
}) {
  return (
    <div className="stat" style={accent ? { borderColor: 'var(--tape)' } : {}}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value${large ? ' lg' : ''} tabular`} style={accent ? { color: 'var(--tape)' } : {}}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const segs = items.concat(items);
  return (
    <div className="marquee">
      <div className="marquee-track">
        {segs.map((it, i) => <span key={i}>{it}</span>)}
      </div>
    </div>
  );
}

export function TopBar({ active, onNav }: { active: string; onNav: (v: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'shiyu',     label: 'Shiyu Defense' },
    { id: 'deadly',    label: 'Deadly Assault' },
    { id: 'voidfront', label: 'Void Front' },
  ];
  const handleNav = (id: string) => { onNav(id); setMenuOpen(false); window.scrollTo({ top: 0 }); };
  return (
    <>
      <div className="topbar">
        <div className="brand-block" onClick={() => handleNav('dashboard')}>
          <span style={{ fontSize: 14 }}>◤ ZIW</span>
          <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.7 }}>{'// PATROL LOG'}</span>
        </div>
        <div className="nav-links">
          {links.map(l => (
            <div key={l.id} className={`nav-link${active === l.id ? ' active' : ''}`} onClick={() => handleNav(l.id)}>
              {l.label}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="topbar-live" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-dim)' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--acid)', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
          <span>LIVE</span>
        </div>
        <button className="hamburger" onClick={() => { setMenuOpen(o => { if (!o) window.scrollTo({ top: 0, behavior: 'smooth' }); return !o; }); }} aria-label="Menu">
          <span>{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <div key={l.id} className={`mobile-nav-item${active === l.id ? ' active' : ''}`} onClick={() => handleNav(l.id)}>
              {active === l.id && <span style={{ color: 'var(--tape)', marginRight: 8 }}>▸</span>}
              {l.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function PeriodScrubber({ periods, active, onPick, label }: {
  periods: Array<{ id: string | number; label: string; score?: number | null; delta?: number | null }>;
  active: number;
  onPick: (i: number) => void;
  label?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <div className="hairline">{label}</div>}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {periods.map((p, i) => (
          <div key={i} className={`period-chip${i === active ? ' active' : ''}`} onClick={() => onPick(i)}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>#{p.id}</div>
            <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 12, marginTop: 2 }}>{p.label}</div>
            {p.score != null && <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--tape)', marginTop: 4 }}>{fmtNum(p.score)}</div>}
            {p.delta != null && p.delta !== 0 && (
              <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 9, marginTop: 2, color: p.delta > 0 ? 'var(--acid)' : 'var(--hot)' }}>
                {p.delta > 0 ? '▲' : '▼'} {fmtNum(Math.abs(p.delta))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InflationIndexPanel({ headline, headlineLabel, narrative, color = 'var(--tape)' }: {
  headline: string;
  headlineLabel: string;
  narrative: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="panel">
      <div className="panel-body" style={{ padding: 24 }}>
        <div className="rg-split">
          <div>
            <div className="hairline">INFLATION INDEX</div>
            <div style={{ fontFamily: 'Archivo Black', fontSize: 52, color, lineHeight: 1, margin: '8px 0' }}>
              {headline}
            </div>
            <div style={{ color: 'var(--ink-dim)', fontSize: 13 }}>{headlineLabel}</div>
          </div>
          <div>
            <div className="hairline" style={{ marginBottom: 12 }}>NARRATIVE</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{narrative}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionDiv({ children, num }: { children: React.ReactNode; num?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 16px' }}>
      {num && (
        <div style={{ background: 'var(--tape)', color: '#000', fontFamily: 'Archivo Black', fontSize: 12, padding: '4px 8px', letterSpacing: '0.06em' }}>
          § {num}
        </div>
      )}
      <div className="display" style={{ fontSize: 22, color: 'var(--ink)' }}>{children}</div>
      <div style={{ flex: 1, height: 2, background: 'var(--line)' }} />
    </div>
  );
}

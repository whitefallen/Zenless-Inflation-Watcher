'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Sticker, Stat, SectionDiv, Team, fmtDateRange } from './shared';
import type { ZZZData, AvatarInfo, HoloBossSeason, HoloClear } from './types';

/** Clear time is a duration, so it formats as m:ss — never as a date. */
function fmtClear(seconds?: number): string {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** rank_percent is a percentile scaled by 100: 1000 -> Top 10.00%. */
function fmtRank(rankPercent?: number): string {
  if (rankPercent == null) return '—';
  return `Top ${(rankPercent / 100).toFixed(2)}%`;
}

export function HoloView({ data, onAgent }: { data: ZZZData; onAgent: (a: AvatarInfo) => void }) {
  const seasons = data.holoBoss || [];
  const [activeIdx, setActiveIdx] = useState(Math.max(0, seasons.length - 1));
  const season: HoloBossSeason | undefined = seasons[activeIdx];
  const clears = season?.clears || [];

  const fastest = clears.length
    ? clears.reduce((a, b) => (a.clear_seconds <= b.clear_seconds ? a : b))
    : null;
  const bestRank = clears.length ? Math.min(...clears.map(c => c.rank_percent)) : null;

  if (!season) {
    return (
      <div className="fade-up view-content" style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <Sticker variant="cyan">HOLO // BOSS</Sticker>
        <div className="hairline" style={{ marginTop: 16 }}>NO SEASON DATA ON RECORD</div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="slice" style={{ padding: '32px', borderBottom: '2px solid var(--line)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Sticker variant="cyan">HOLO // BOSS</Sticker>
            <span className="hairline">{season.unlock ? 'UNLOCKED' : 'LOCKED'}</span>
            <span className="hairline" style={{ marginLeft: 'auto' }}>
              {fmtDateRange(season.start_time, season.end_time)}
            </span>
          </div>
          <div className="kinetic" style={{ fontSize: 'clamp(40px, 6vw, 72px)', marginBottom: 16 }}>
            HOLO <span className="stroke">BOSS</span>
          </div>
          <div style={{ maxWidth: 640, color: 'var(--ink-dim)', fontSize: 14, marginBottom: 24 }}>
            Boss rush on the clock. No score — just stars, clear times, and whether you walked out untouched.
          </div>
          <div className="rg-4">
            <Stat large label="Total Stars" value={`${season.total_star}★`} sub={`${clears.length} bosses`} accent />
            <Stat label="Fastest Clear" value={fmtClear(fastest?.clear_seconds)} sub={fastest?.boss?.split(' - ').pop() || '—'} />
            <Stat label="Best Rank" value={fmtRank(bestRank ?? undefined)} sub="server percentile" />
            <Stat label="Flawless" value={`${season.flawless}/${clears.length}`} sub="no damage taken" />
          </div>
        </div>
      </div>

      <div className="view-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {seasons.length > 1 && (
          <>
            <SectionDiv num="01">Seasons</SectionDiv>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {seasons.map((s, i) => (
                <button
                  key={s.season_id}
                  className={`btn${i === activeIdx ? ' primary' : ''}`}
                  onClick={() => setActiveIdx(i)}
                >
                  {String(s.season_id).slice(0, 4)}-{String(s.season_id).slice(4, 6)}
                </button>
              ))}
            </div>
          </>
        )}

        <SectionDiv num={seasons.length > 1 ? '02' : '01'}>Boss Ledger</SectionDiv>
        <div className="holo-grid panel-grid">
          {clears.map((c: HoloClear, i) => (
            <div key={i} className="panel relative holo-card">
              <div className="corner-tag">{c.star}★</div>
              <div className="holo-card-head">
                {c.boss_icon && (
                  <Image src={c.boss_icon} width={72} height={72} unoptimized
                    style={{ width: 72, height: 72, objectFit: 'cover', border: '1.5px solid var(--cyan)' }}
                    alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div className="hairline" style={{ color: 'var(--cyan)' }}>TARGET</div>
                  <div className="display holo-boss-name">{c.boss}</div>
                </div>
                {c.no_injured && c.medal_icon && (
                  <Image src={c.medal_icon} width={40} height={40} unoptimized
                    className="holo-medal"
                    style={{ width: 40, height: 40, objectFit: 'contain' }}
                    title="Cleared without taking damage"
                    alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
              <div className="holo-card-body">
                <div className="holo-metrics">
                  <div>
                    <div className="hairline">CLEAR TIME</div>
                    <div className="tabular holo-time">{fmtClear(c.clear_seconds)}</div>
                  </div>
                  <div>
                    <div className="hairline">SERVER RANK</div>
                    <div className="tabular holo-rank">{fmtRank(c.rank_percent)}</div>
                  </div>
                </div>
                {/* Always rendered so the row keeps its height — a card without
                    the medal must not pull the metrics and squad out of line
                    with its neighbours. Hidden copies are inert for a11y. */}
                <div
                  className={`holo-flawless${c.no_injured ? '' : ' is-empty'}`}
                  aria-hidden={c.no_injured ? undefined : true}
                >
                  ◆ NO DAMAGE TAKEN
                </div>
                <Team avatars={c.avatars} size="sm" onClick={onAgent} />
              </div>
            </div>
          ))}
        </div>

        <SectionDiv num={seasons.length > 1 ? '03' : '02'}>Season Read</SectionDiv>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" />
            <span className="hairline">HOLO BOSS · SEASON SUMMARY</span>
          </div>
          <div className="panel-body" style={{ padding: 24 }}>
            <div className="rg-split">
              <div>
                <div className="hairline">TOTAL STARS</div>
                <div style={{ fontFamily: 'Archivo Black', fontSize: 52, color: 'var(--cyan)', lineHeight: 1, margin: '8px 0' }}>
                  {season.total_star}★
                </div>
                <div style={{ color: 'var(--ink-dim)', fontSize: 13 }}>
                  ACROSS {clears.length} BOSS{clears.length === 1 ? '' : 'ES'}
                </div>
              </div>
              <div>
                <div className="hairline" style={{ marginBottom: 12 }}>NARRATIVE</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>
                  {clears.length} boss{clears.length === 1 ? '' : 'es'} on record.
                  {fastest && <> Fastest takedown <span style={{ color: 'var(--cyan)' }}>{fmtClear(fastest.clear_seconds)}</span> on {fastest.boss?.split(' - ').pop()}.</>}
                  {' '}Walked out untouched <span style={{ color: 'var(--cyan)' }}>{season.flawless}</span> of {clears.length} times.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
          <span>HOLO BOSS · {season.total_star}★ · {season.flawless} FLAWLESS</span>
          <span>◤ END OF LEDGER ◢</span>
        </div>
      </div>
    </div>
  );
}

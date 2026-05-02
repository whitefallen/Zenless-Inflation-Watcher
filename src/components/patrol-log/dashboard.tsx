'use client';
import React from 'react';
import { Sticker, Stat, Marquee, SectionDiv, Agent, fmtNum, ratingClass, tsToDate, elementInfo } from './shared';
import { AreaLineChart, useChartH } from './charts';
import type { ZZZData, AvatarInfo } from './types';

export function Dashboard({ data, onNav }: { data: ZZZData; onNav: (v: string) => void }) {
  const shiyuLatest = data.shiyu[data.shiyu.length - 1];
  const shiyuPrev = data.shiyu[data.shiyu.length - 2];
  const daLatest = data.deadlyAssault[data.deadlyAssault.length - 1];
  const vf = data.voidFront[0];

  const chartH = useChartH(280, 180);

  const shiyuTrend = data.shiyu.map(p => ({
    label: '#' + String(p.zone_id).slice(-3),
    score: p.brief?.score || 0,
    rating: p.brief?.rating,
  }));

  const charCount: Record<number, AvatarInfo & { count: number }> = {};
  data.shiyu.forEach(p => p.layers.forEach(L => L.avatars.forEach(a => {
    charCount[a.id] = charCount[a.id] || { ...a, count: 0 };
    charCount[a.id].count++;
  })));
  data.deadlyAssault.forEach(p => p.runs.forEach(r => r.avatars.forEach(a => {
    charCount[a.id] = charCount[a.id] || { ...a, count: 0 };
    charCount[a.id].count++;
  })));
  const topChars = Object.values(charCount).sort((a, b) => b.count - a.count).slice(0, 8);

  const shiyuDelta = shiyuLatest && shiyuPrev ? shiyuLatest.brief.score - shiyuPrev.brief.score : 0;

  return (
    <div className="fade-up">
      {/* Hero strip */}
      <div className="slice" style={{ padding: '48px 32px 32px', borderBottom: '2px solid var(--line)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Sticker variant="red">● LIVE PATROL</Sticker>
            <span className="hairline">FILE NO. ZIW-2026 · CLASSIFIED</span>
            <span className="hairline" style={{ marginLeft: 'auto' }}>LAST SYNC · LIVE</span>
          </div>
          <div className="kinetic" style={{ marginBottom: 24 }}>
            HOLLOW <span className="stroke">ZERO</span><br />
            PATROL LOG.
          </div>
          <div style={{ maxWidth: 720, color: 'var(--ink-dim)', fontSize: 15, lineHeight: 1.5, marginBottom: 32 }}>
            Inflation tracker for New Eridu. Three combat trials, one ledger. Watch your score climb,
            your meta drift, and the server inch its standards higher every fortnight.
          </div>
          <div className="rg-4">
            <Stat label="Latest Hadal Score" value={fmtNum(shiyuLatest?.brief?.score)} sub={`${shiyuLatest?.brief?.rating} · Top ${((shiyuLatest?.brief?.rank_percent || 0) / 100).toFixed(2)}%`} accent />
            <Stat label="Δ vs Prev Period" value={(shiyuDelta >= 0 ? '+' : '') + fmtNum(shiyuDelta)} sub={`Trend: ${shiyuDelta >= 0 ? 'INFLATING ↑' : 'COOLING ↓'}`} />
            <Stat label="Deadly Assault" value={fmtNum(daLatest?.total_score)} sub={`Top ${((daLatest?.rank_percent || 0) / 100).toFixed(2)}% · ${daLatest?.total_star}★`} />
            <Stat label="Void Front Run" value={fmtNum(vf?.total_score)} sub={`${vf?.boss?.name || '—'} · ${vf?.main?.score_ratio ?? '—'}× ratio`} />
          </div>
        </div>
      </div>

      <Marquee items={[
        '◤ INFLATION WATCH ACTIVE',
        `${shiyuDelta >= 0 ? '+' : ''}${fmtNum(shiyuDelta)} vs LAST CYCLE`,
        `${shiyuLatest?.brief?.rating} CLEARED ON FRONTIER ${shiyuLatest?.zone_id}`,
        'SERVER MEDIAN: ESCALATING',
        topChars[0] ? `AGENT ${topChars[0].id} · MOST DEPLOYED` : 'AGENT DOSSIER ACTIVE',
        '◢ STAY SHARP, PROXY',
      ]} />

      <div className="view-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        <SectionDiv num="01">Three Trials</SectionDiv>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="panel-grid">
          <ModuleCard num="01" tag="HADAL" title="Shiyu Defense"
            sub="Score-based, 5-floor blacksite gauntlet. v2 schema."
            stat={fmtNum(shiyuLatest?.brief?.score)} statLabel="LATEST SCORE"
            rating={shiyuLatest?.brief?.rating}
            rank={shiyuLatest ? `Top ${((shiyuLatest.brief.rank_percent || 0) / 100).toFixed(2)}%` : undefined}
            sticker={shiyuLatest?.pass5 ? '5F CLEAR' : '5F INCOMPLETE'}
            onClick={() => onNav('shiyu')} />
          <ModuleCard num="02" tag="VOID" title="Void Front"
            sub="Long-form ending-driven boss expedition."
            stat={fmtNum(vf?.total_score)} statLabel="ENDING SCORE"
            rating={String(vf?.main?.star ?? '—')}
            rank={vf ? `Top ${((vf.rank_percent || 0) / 100).toFixed(2)}%` : undefined}
            sticker={vf?.ending}
            onClick={() => onNav('voidfront')} />
          <ModuleCard num="03" tag="DEADLY" title="Deadly Assault"
            sub="3-run boss rotation, star-rated, fortnightly cycle."
            stat={fmtNum(daLatest?.total_score)} statLabel="LATEST TOTAL"
            rating={`${daLatest?.total_star ?? '—'}★`}
            rank={daLatest ? `Top ${(daLatest.rank_percent / 100).toFixed(2)}%` : undefined}
            sticker={`${daLatest?.total_star ?? 0}★ ACROSS ${daLatest?.runs?.length ?? 0} RUNS`}
            onClick={() => onNav('deadly')} />
        </div>

        <SectionDiv num="02">Inflation Curve · Shiyu</SectionDiv>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" />
            <span className="hairline">SCORE PROGRESSION · LATEST {shiyuTrend.length} PERIODS</span>
            <span className="hairline" style={{ marginLeft: 'auto' }}>{shiyuTrend.length} DATA POINTS</span>
          </div>
          <div className="panel-body" style={{ padding: '24px 16px' }}>
            <AreaLineChart data={shiyuTrend} height={chartH} color="#FFD400" yKey="score" formatY={v => (v / 1000).toFixed(0) + 'k'} />
          </div>
        </div>

        <SectionDiv num="03">Inflation Index · All Trials</SectionDiv>
        <InflationSummary data={data} onNav={onNav} />

        <div className="rg-2" style={{ marginTop: 24 }}>
          <div className="panel">
            <div className="panel-header">
              <span className="dot" />
              <span className="hairline">MOST DEPLOYED · CROSS-MODE</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {topChars.map((c, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', background: 'var(--asphalt-3)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 4, left: 4, fontFamily: 'Archivo Black', fontSize: 10, color: 'var(--tape)' }}>#{i + 1}</div>
                    <Agent a={c} size="md" />
                    <div className="hairline" style={{ fontSize: 9, marginTop: 2 }}>{elementInfo(c.element).short}</div>
                    <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 14, color: 'var(--tape)' }}>{c.count}×</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="dot" />
              <span className="hairline">RECENT OPERATIONS</span>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <RecentOps data={data} onNav={onNav} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
          <span>ZZZ INFLATION WATCHER · v2.0 · {data.shiyu.length} HADAL CYCLES · {data.deadlyAssault.length} DA CYCLES</span>
          <span>◤ END OF PATROL ◢</span>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ num, tag, title, sub, stat, statLabel, rating, rank, sticker, onClick }: {
  num: string; tag: string; title: string; sub: string; stat: string;
  statLabel: string; rating?: string; rank?: string; sticker?: string; onClick: () => void;
}) {
  return (
    <div className="panel relative" style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--tape)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
    >
      <div className="corner-tag">§ {num}</div>
      <div className="panel-body" style={{ padding: 20 }}>
        <div className="hairline" style={{ marginBottom: 12 }}>{'// '}{tag} TRIAL</div>
        <div className="display" style={{ fontSize: 28, marginBottom: 8 }}>{title}</div>
        <div style={{ color: 'var(--ink-dim)', fontSize: 13, marginBottom: 20, lineHeight: 1.4 }}>{sub}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid var(--line)', paddingTop: 16 }}>
          <div>
            <div className="hairline" style={{ fontSize: 9 }}>{statLabel}</div>
            <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 28, color: 'var(--tape)' }}>{stat}</div>
            {rank && <div className="hairline" style={{ fontSize: 10, color: 'var(--ink-dim)', marginTop: 4 }}>{rank}</div>}
          </div>
          {rating && <div className={`rating ${ratingClass(rating)}`}>{rating}</div>}
        </div>
        {sticker && <div style={{ marginTop: 12 }}><span className="sticker dark">{sticker}</span></div>}
        <div style={{ marginTop: 16, fontFamily: 'Archivo Black', fontSize: 11, letterSpacing: '0.12em', color: 'var(--tape)' }}>OPEN DOSSIER →</div>
      </div>
    </div>
  );
}

function InflationSummary({ data, onNav }: { data: ZZZData; onNav: (v: string) => void }) {
  const shiyu = data.shiyu[data.shiyu.length - 1];
  const vf = data.voidFront[0];
  const da = data.deadlyAssault[data.deadlyAssault.length - 1] as { total_score: number; total_star: number; rank_percent: number; runs: Array<{ score: number; boss: Array<{ name?: string }> }> };
  const vfMain = (vf as unknown as Record<string, unknown>)?.main as Record<string, unknown> | undefined;

  const cards = [
    {
      tag: 'HADAL', color: 'var(--tape)', route: 'shiyu',
      headline: (() => { const b = shiyu?.brief as (typeof shiyu.brief & { max_score?: number }) | undefined; return b?.max_score ? `${((b.score / b.max_score) * 100).toFixed(1)}%` : '—'; })(),
      label: 'of ceiling reached',
      detail: `${shiyu?.brief?.rating ?? '—'} · Top ${((shiyu?.brief?.rank_percent || 0) / 100).toFixed(2)}%`,
      note: shiyu?.pass5 ? 'Floor-five confirmed.' : 'Floor-five pending.',
    },
    {
      tag: 'VOID', color: 'var(--cyan)', route: 'voidfront',
      headline: (() => { const vfAny = vf as unknown as Record<string, number>; return vfAny?.max_score ? `${((vf.total_score / vfAny.max_score) * 100).toFixed(1)}%` : '—'; })(),
      label: (() => { const vfAny = vf as unknown as Record<string, number>; return vfAny?.max_score ? `of ${fmtNum(vfAny.max_score)} ceiling` : 'of ceiling'; })(),
      detail: `Ending: ${vf?.ending || '—'} · ${vfMain?.star ?? '—'}★`,
      note: `Total: ${fmtNum(vf?.total_score)}.`,
    },
    {
      tag: 'DEADLY', color: 'var(--hot)', route: 'deadly',
      headline: da?.total_max_score ? `${((da.total_score / da.total_max_score) * 100).toFixed(1)}%` : '—',
      label: da?.total_max_score ? `of ${fmtNum(da.total_max_score)} ceiling` : 'of ceiling',
      detail: `Top ${((da?.rank_percent || 0) / 100).toFixed(2)}% · ${fmtNum(da?.total_score)}`,
      note: (() => {
        const best = da?.runs?.reduce((b, r) => r.score > (b?.score ?? 0) ? r : b, null as typeof da.runs[0] | null);
        return best ? `Best: ${best.boss[0]?.name || '—'}.` : '';
      })(),
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="panel-grid">
      {cards.map(c => (
        <div key={c.route} className="panel" style={{ cursor: 'pointer' }}
          onClick={() => onNav(c.route)}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = c.color)}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--line)')}
        >
          <div className="panel-body" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="hairline">{'// '}{c.tag} TRIAL</span>
              <span className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>INFLATION INDEX</span>
            </div>
            <div style={{ fontFamily: 'Archivo Black', fontSize: 42, color: c.color, lineHeight: 1, marginBottom: 4 }}>{c.headline}</div>
            <div style={{ color: 'var(--ink-dim)', fontSize: 12, marginBottom: 12 }}>{c.label}</div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <div className="hairline" style={{ fontSize: 10, marginBottom: 4 }}>{c.detail}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{c.note}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentOps({ data, onNav }: { data: ZZZData; onNav: (v: string) => void }) {
  type Op = { kind: string; label: string; score: number; rating: string; time: unknown; route: string };
  const ops: Op[] = [];
  data.shiyu.slice(-2).forEach(p => p.layers.slice(0, 2).forEach(L => {
    ops.push({ kind: 'shiyu', label: 'HADAL F' + String(L.layer_id).slice(-1), score: L.score, rating: L.rating, time: L.challenge_time, route: 'shiyu' });
  }));
  data.deadlyAssault.slice(-2).forEach(p => p.runs.slice(0, 2).forEach(r => {
    ops.push({ kind: 'deadly', label: r.boss[0]?.name?.slice(0, 24) || 'Boss', score: r.score, rating: r.star + '★', time: r.challenge_time, route: 'deadly' });
  }));
  ops.sort((a, b) => {
    const da = tsToDate(a.time as Parameters<typeof tsToDate>[0]);
    const db = tsToDate(b.time as Parameters<typeof tsToDate>[0]);
    return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
  });

  return (
    <div>
      {ops.slice(0, 8).map((o, i) => (
        <div key={i} className="slide-right" style={{
          display: 'grid', gridTemplateColumns: '60px 1fr auto auto', gap: 12, alignItems: 'center',
          padding: '10px 14px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
          animationDelay: `${i * 30}ms`,
        }}
          onClick={() => onNav(o.route)}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--asphalt-3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div className="hairline" style={{ color: o.kind === 'shiyu' ? 'var(--tape)' : 'var(--hot)' }}>{o.kind.toUpperCase()}</div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>{o.label}</div>
          <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>{fmtNum(o.score)}</div>
          <div className={`rating ${ratingClass(o.rating)}`} style={{ width: 28, height: 28, fontSize: 13 }}>{o.rating}</div>
        </div>
      ))}
    </div>
  );
}

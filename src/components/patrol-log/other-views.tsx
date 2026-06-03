'use client';
import React, { useState } from 'react';
import { Sticker, Stat, SectionDiv, PeriodScrubber, Agent, Team, InflationIndexPanel, fmtNum, fmtDateRange, elementInfo, professionName, ratingClass } from './shared';
import { AreaLineChart, useChartH } from './charts';
import type { ZZZData, AvatarInfo } from './types';

type AvatarExt = AvatarInfo & { level?: number };
type RunExt = {
  boss: Array<{ id?: number; name?: string; icon?: string; bg_icon?: string }>;
  score: number;
  star: number;
  total_star?: number;
  challenge_time?: Record<string, number>;
  avatars: AvatarInfo[];
  buffer?: Array<{ name?: string; desc?: string }>;
};
type DAExt = {
  schedule_id?: number;
  total_score: number;
  total_max_score?: number;
  total_star: number;
  rank_percent: number;
  start_time?: Record<string, number>;
  end_time?: Record<string, number>;
  begin_time?: Record<string, number>;
  runs: RunExt[];
};

function fmtTs(ts: unknown): string {
  if (!ts || typeof ts !== 'object') return '—';
  const t = ts as Record<string, number>;
  const m = String(t.month).padStart(2, '0');
  const d = String(t.day).padStart(2, '0');
  return `${t.year}-${m}-${d}`;
}
function fmtTsShortAny(ts: unknown): string {
  if (!ts || typeof ts !== 'object') return '—';
  const t = ts as Record<string, number>;
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${months[(t.month || 1) - 1]} ${t.day}`;
}
function cleanText(t: string): string {
  return (t || '').replace(/<color=#[0-9A-F]+>/gi, '').replace(/<\/color>/gi, '').replace(/\\n/g, '\n');
}

export function VoidFrontView({ data, onAgent, initialPeriodId, onPeriodChange }: { data: ZZZData; onAgent: (a: AvatarInfo) => void; initialPeriodId?: number | null; onPeriodChange?: (id: number) => void }) {
  const periods = data.voidFront;
  const [activeIdx, setActiveIdx] = useState(() => {
    if (initialPeriodId != null) {
      const idx = periods.findIndex(p => (p as unknown as Record<string, number>).void_front_id === initialPeriodId);
      if (idx !== -1) return idx;
    }
    return periods.length - 1;
  });
  const vf = periods[activeIdx];
  if (!vf) return <div className="empty">No Void Front data.</div>;
  const main = (vf as unknown as Record<string, unknown>).main as Record<string, unknown> | undefined;
  const subs = (main?.sub_challenges as unknown[]) || [];

  return (
    <div className="fade-up">
      <div className="slice" style={{ padding: '32px', borderBottom: '2px solid var(--line)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Sticker variant="cyan">VOID // FRONT</Sticker>
            <span className="hairline">EXPEDITION LOG · PERIOD {(vf as unknown as Record<string, number>).void_front_id ?? activeIdx + 1}</span>
          </div>
          <div className="kinetic" style={{ fontSize: 'clamp(40px, 6vw, 72px)', marginBottom: 16 }}>
            VOID <span className="stroke">FRONT</span>
          </div>
          <div style={{ maxWidth: 640, color: 'var(--ink-dim)', fontSize: 14, marginBottom: 24 }}>
            Long-form ending-driven boss expedition. Score, ending, and team on record.
          </div>
          <div className="rg-4">
            <Stat large label="Ending Score" value={fmtNum(vf.total_score)} sub={vf.max_score ? `/ ${fmtNum(vf.max_score)} cap` : undefined} accent />
            <Stat label="Server Rank" value={`Top ${((vf.rank_percent || 0) / 100).toFixed(2)}%`} sub="of ranked servers" />
            <Stat label="Score Ratio" value={`${main?.score_ratio ?? '—'}×`} sub={String(vf.ending || '—')} />
            <Stat label="Stars" value={String(main?.star ?? '—')} />
          </div>
        </div>
      </div>

      <div className="view-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {periods.length > 1 && (
          <>
            <SectionDiv num="01">Period Scrubber</SectionDiv>
            <PeriodScrubber
              periods={periods.map((p, i) => ({
                id: (p as unknown as Record<string, number>).void_front_id ?? i + 1,
                label: p.ending?.replace(/^Ending \d+: /, '').slice(0, 18) || '—',
                score: p.total_score,
                delta: i > 0 ? p.total_score - periods[i - 1].total_score : null,
              }))}
              active={activeIdx}
              onPick={i => { setActiveIdx(i); onPeriodChange?.((periods[i] as unknown as Record<string, number>).void_front_id ?? i); }}
            />
          </>
        )}

        {/* Boss record + main challenge squad */}
        {vf.boss && (
          <>
            <SectionDiv num="02">Target Record</SectionDiv>
            <div className="panel">
              <div className="panel-body" style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 32 }}>
                  <div>
                    <div className="hairline" style={{ marginBottom: 8 }}>BOSS TARGET</div>
                    <div className="display" style={{ fontSize: 36 }}>{vf.boss.name}</div>
                    {main?.score != null && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div>
                          <div className="hairline" style={{ fontSize: 9 }}>LAST NODE SCORE</div>
                          <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 22, color: 'var(--cyan)' }}>
                            {fmtNum(main.score as number)}
                            {main.max_score != null && <span style={{ fontSize: 13, color: 'var(--ink-faint)', marginLeft: 4 }}>/ {fmtNum(main.max_score as number)}</span>}
                          </div>
                        </div>
                        {main.score_ratio != null && (
                          <div>
                            <div className="hairline" style={{ fontSize: 9 }}>RATIO</div>
                            <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 22 }}>{String(main.score_ratio)}×</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {(main?.avatars as AvatarInfo[] | undefined)?.length ? (
                    <div>
                      <div className="hairline" style={{ marginBottom: 10 }}>LAST NODE SQUAD</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(main!.avatars as AvatarInfo[]).map((a, i) => (
                          <Agent key={i} a={a} size="lg" onClick={onAgent} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sub-challenges */}
        {subs.length > 0 && (
          <>
            <SectionDiv num="03">Sub-Challenges</SectionDiv>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }} className="panel-grid">
              {subs.map((s: unknown, i: number) => {
                const sub = s as Record<string, unknown>;
                const buf = sub.buffer as Record<string, string> | undefined;
                return (
                  <div key={i} className="panel relative">
                    <div className="corner-tag">{sub.name as string || i + 1}</div>
                    <div style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 }}>
                        <div className={`rating ${ratingClass(sub.star as string)}`} style={{ width: 24, height: 24, fontSize: 12 }}>{sub.star as string}</div>
                        {buf?.name && <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>⚡ {buf.name.slice(0, 20)}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {((sub.avatars as AvatarInfo[]) || []).map((a: AvatarInfo, j: number) => (
                          <Agent key={j} a={a} size="sm" onClick={onAgent} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <SectionDiv num="04">Cross-Season Squad Ledger</SectionDiv>
        {(() => {
          const map = new Map<string, { avatars: AvatarInfo[]; count: number; scores: number[]; names: string[]; periods: Set<number> }>();
          data.voidFront.forEach((p, pi) => {
            const m = (p as unknown as Record<string, unknown>).main as Record<string, unknown> | undefined;
            const challenges = (m?.sub_challenges as unknown[]) || (p.challenges as unknown[]) || [];
            challenges.forEach((ch: unknown) => {
              const c = ch as Record<string, unknown>;
              const avatars = (c.avatars as AvatarInfo[]) || [];
              if (!avatars.length) return;
              const sorted = [...avatars].sort((a, b) => a.id - b.id);
              const key = sorted.map(a => a.id).join('-');
              if (!map.has(key)) map.set(key, { avatars: sorted, count: 0, scores: [], names: [], periods: new Set() });
              const e = map.get(key)!;
              e.count++;
              const score = typeof c.score === 'number' ? c.score : 0;
              if (score > 0) e.scores.push(score);
              const name = typeof c.name === 'string' ? c.name : '';
              if (name && !e.names.includes(name)) e.names.push(name);
              e.periods.add(pi);
            });
          });
          const squads = Array.from(map.values()).sort((a, b) => b.count - a.count);
          if (!squads.length) return null;
          return (
            <div className="panel">
              <div className="panel-header">
                <span className="dot" />
                <span className="hairline">{squads.length} UNIQUE SQUADS · {data.voidFront.length} PERIODS LOGGED</span>
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {squads.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 12px', background: 'var(--asphalt)', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.avatars.map((a, j) => <Agent key={j} a={a} size="sm" onClick={onAgent} />)}
                      </div>
                      <div style={{ display: 'flex', gap: 20, marginLeft: 'auto', alignItems: 'center' }}>
                        <div>
                          <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>DEPLOYMENTS</div>
                          <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 18, color: 'var(--tape)' }}>×{s.count}</div>
                        </div>
                        <div>
                          <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>PERIODS</div>
                          <div className="tabular" style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{s.periods.size}</div>
                        </div>
                        {s.scores.length > 0 && (
                          <div>
                            <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>BEST SCORE</div>
                            <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--cyan)' }}>{fmtNum(Math.max(...s.scores))}</div>
                          </div>
                        )}
                        {s.scores.length > 0 && (
                          <div>
                            <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>AVG SCORE</div>
                            <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--ink-dim)' }}>{fmtNum(Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length))}</div>
                          </div>
                        )}
                        {s.names.length > 0 && (
                          <div style={{ maxWidth: 160 }}>
                            <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>CHALLENGES</div>
                            <div style={{ fontSize: 10, color: 'var(--ink-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.names.slice(0, 2).join(', ')}{s.names.length > 2 ? ` +${s.names.length - 2}` : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <SectionDiv num="05">Inflation Index</SectionDiv>
        <InflationIndexPanel
          headline={vf.max_score ? `${((vf.total_score / vf.max_score) * 100).toFixed(1)}%` : '—'}
          headlineLabel={vf.max_score ? `of ${fmtNum(vf.max_score)} point ceiling reached` : 'of ceiling reached'}
          color="var(--cyan)"
          narrative={<>
            Ending <span style={{ color: 'var(--cyan)' }}>{vf.ending || '—'}</span> reached.
            Score ratio <span style={{ color: 'var(--cyan)' }}>{String(main?.score_ratio ?? '—')}×</span> on record.
            {main?.star != null && <> <span style={{ color: 'var(--tape)' }}>{String(main.star)}★</span> awarded.</>}
            {' '}Total haul: <span className="tabular" style={{ color: 'var(--tape)' }}>{fmtNum(vf.total_score)}</span>.
          </>}
        />

        <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
          <span>VOID FRONT · ENDING: {vf.ending || '—'} · TOTAL: {fmtNum(vf.total_score)}</span>
          <span>◤ END OF EXPEDITION ◢</span>
        </div>
      </div>
    </div>
  );
}

export function DeadlyView({ data, onAgent, initialPeriodId, onPeriodChange }: { data: ZZZData; onAgent: (a: AvatarInfo) => void; initialPeriodId?: number | null; onPeriodChange?: (id: number) => void }) {
  const periods = data.deadlyAssault as unknown as DAExt[];
  const [activeIdx, setActiveIdx] = useState(() => {
    if (initialPeriodId != null) {
      const idx = periods.findIndex(p => (p as unknown as { zone_id?: number }).zone_id === initialPeriodId);
      if (idx !== -1) return idx;
    }
    return periods.length - 1;
  });
  const [runModal, setRunModal] = useState<RunExt | null>(null);
  const period = periods[activeIdx];
  const chartH = useChartH(240, 160);

  const trendData = periods.map(p => ({
    label: fmtTsShortAny(p.start_time || p.begin_time),
    score: p.total_score,
    rank: p.rank_percent,
  }));

  const bossScores: Record<string, { name: string; scores: number[]; total: number; runs: number; avg: number }> = {};
  periods.forEach(p => p.runs.forEach(r => {
    const name = r.boss[0]?.name || 'Unknown';
    bossScores[name] = bossScores[name] || { name, scores: [], total: 0, runs: 0, avg: 0 };
    bossScores[name].scores.push(r.score);
    bossScores[name].total += r.score;
    bossScores[name].runs++;
    bossScores[name].avg = bossScores[name].total / bossScores[name].runs;
  }));
  const bossList = Object.values(bossScores).sort((a, b) => b.avg - a.avg).slice(0, 8);

  return (
    <div className="fade-up">
      <div className="slice" style={{ padding: '32px', borderBottom: '2px solid var(--line)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Sticker variant="red">DEADLY // ASSAULT</Sticker>
            <span className="hairline">CYCLE · {fmtTs(period?.start_time || period?.begin_time)}</span>
            <span className="hairline" style={{ marginLeft: 'auto' }}>{fmtDateRange(period?.start_time as never, period?.end_time as never)}</span>
          </div>
          <div className="kinetic" style={{ fontSize: 'clamp(40px, 6vw, 72px)', marginBottom: 16 }}>
            DEADLY <span className="stroke">ASSAULT</span>
          </div>
          <div style={{ maxWidth: 640, color: 'var(--ink-dim)', fontSize: 14, marginBottom: 24 }}>
            Three runs. Three bosses. Stars on the line. Fortnightly cycle, ruthless meta.
          </div>
          <div className="rg-4">
            <Stat large label="Cycle Total" value={fmtNum(period?.total_score)} accent />
            <Stat label="Stars" value={`${period?.total_star || 0}★`} sub={`${period?.runs?.length || 0} runs`} />
            <Stat label="Server Rank" value={`Top ${((period?.rank_percent || 0) / 100).toFixed(2)}%`} sub="of ranked servers" />
            <Stat label="Best Run" value={fmtNum(Math.max(...(period?.runs?.map(r => r.score) || [0])))} />
          </div>
        </div>
      </div>

      <div className="view-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        <SectionDiv num="01">Inflation Curve</SectionDiv>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-header">
              <span className="dot" />
              <span className="hairline">SCORE PER CYCLE · {periods.length} POINTS</span>
            </div>
            <div className="panel-body" style={{ padding: '24px 8px 8px 8px' }}>
              <AreaLineChart data={trendData} height={chartH} color="#FF3D2E" yKey="score" formatY={v => (v / 1000).toFixed(0) + 'k'} />
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">
              <span className="dot" />
              <span className="hairline">SERVER RANK % · LOWER IS BETTER ↓</span>
            </div>
            <div className="panel-body" style={{ padding: '24px 8px 8px 8px' }}>
              <AreaLineChart data={trendData} height={chartH} color="#2BE0FF" yKey="rank" formatY={v => (v / 100).toFixed(2) + '%'} invertY />
            </div>
          </div>
        </div>

        <SectionDiv num="02">Cycle Scrubber</SectionDiv>
        <PeriodScrubber
          periods={periods.map((p, i) => ({
            id: fmtTsShortAny(p.start_time || p.begin_time),
            label: 'CYC',
            score: p.total_score,
            delta: i > 0 ? p.total_score - periods[i - 1].total_score : null,
          }))}
          active={activeIdx}
          onPick={i => { setActiveIdx(i); onPeriodChange?.((periods[i] as unknown as { zone_id?: number }).zone_id ?? i); }}
        />

        <SectionDiv num="03">Runs · This Cycle</SectionDiv>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="panel-grid">
          {(period?.runs || []).map((run, i) => (
            <div key={i} className="panel relative" style={{ cursor: 'pointer' }}
              onClick={() => setRunModal(run)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--hot)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--line)')}
            >
              <div className="corner-tag">RUN {i + 1}</div>
              <div style={{ position: 'relative', height: 100, overflow: 'hidden', borderBottom: '1.5px solid var(--line)' }}>
                {run.boss[0]?.bg_icon && (
                  <img src={run.boss[0].bg_icon} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'linear-gradient(90deg, rgba(10,10,11,0.9), rgba(10,10,11,0.3))' }}>
                  {run.boss[0]?.icon && (
                    <img src={run.boss[0].icon} style={{ width: 64, height: 64, border: '1.5px solid var(--tape)' }} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <div>
                    <div className="hairline">TARGET</div>
                    <div className="display" style={{ fontSize: 14 }}>{run.boss[0]?.name}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 22, color: 'var(--tape)' }}>{fmtNum(run.score)}</div>
                  <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 16 }}>{run.star}/{run.total_star ?? 3}★</div>
                </div>
                <Team avatars={run.avatars} size="sm" />
                {run.buffer?.[0]?.name && (
                  <div className="hairline" style={{ fontSize: 9, marginTop: 10 }}>⚡ {run.buffer[0].name}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <SectionDiv num="04">Boss Difficulty Ledger</SectionDiv>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" />
            <span className="hairline">AVG SCORE BY BOSS · ALL CYCLES</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bossList.map((b, i) => {
                const maxAvg = bossList[0]?.avg || 1;
                const pct = (b.avg / maxAvg) * 100;
                return (
                  <div key={i} className="boss-row">
                    <div className="hairline" style={{ color: 'var(--tape)' }}>#{i + 1}</div>
                    <div style={{ position: 'relative', height: 28, background: 'var(--asphalt-3)', border: '1px solid var(--line)' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'var(--hot)', opacity: 0.3 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: 'Inter', fontSize: 12, fontWeight: 600 }}>{b.name}</div>
                    </div>
                    <div className="tabular hairline boss-runs" style={{ textAlign: 'right' }}>{b.runs} RUN{b.runs > 1 ? 'S' : ''}</div>
                    <div className="tabular" style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--tape)' }}>{fmtNum(Math.round(b.avg))}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <SectionDiv num="05">Cross-Season Squad Ledger</SectionDiv>
        {(() => {
          const map = new Map<string, { avatars: AvatarInfo[]; count: number; scores: number[]; bosses: string[]; periods: Set<number> }>();
          (data.deadlyAssault as unknown as DAExt[]).forEach((p, pi) => {
            (p.runs || []).forEach(run => {
              const avatars = (run as unknown as RunExt).avatars || [];
              if (!avatars.length) return;
              const sorted = [...avatars].sort((a, b) => a.id - b.id);
              const key = sorted.map(a => a.id).join('-');
              if (!map.has(key)) map.set(key, { avatars: sorted, count: 0, scores: [], bosses: [], periods: new Set() });
              const e = map.get(key)!;
              e.count++;
              if (run.score > 0) e.scores.push(run.score);
              const bossName = run.boss?.[0]?.name;
              if (bossName && !e.bosses.includes(bossName)) e.bosses.push(bossName);
              e.periods.add(pi);
            });
          });
          const squads = Array.from(map.values()).sort((a, b) => b.count - a.count);
          if (!squads.length) return null;
          return (
            <div className="panel">
              <div className="panel-header">
                <span className="dot" />
                <span className="hairline">{squads.length} UNIQUE SQUADS · {data.deadlyAssault.length} CYCLES ON RECORD</span>
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {squads.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 12px', background: 'var(--asphalt)', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.avatars.map((a, j) => <Agent key={j} a={a} size="sm" onClick={onAgent} />)}
                      </div>
                      <div style={{ display: 'flex', gap: 20, marginLeft: 'auto', alignItems: 'center' }}>
                        <div>
                          <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>DEPLOYMENTS</div>
                          <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 18, color: 'var(--tape)' }}>×{s.count}</div>
                        </div>
                        <div>
                          <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>CYCLES</div>
                          <div className="tabular" style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{s.periods.size}</div>
                        </div>
                        {s.scores.length > 0 && (
                          <div>
                            <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>BEST SCORE</div>
                            <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--hot)' }}>{fmtNum(Math.max(...s.scores))}</div>
                          </div>
                        )}
                        {s.scores.length > 0 && (
                          <div>
                            <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>AVG SCORE</div>
                            <div className="tabular" style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--ink-dim)' }}>{fmtNum(Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length))}</div>
                          </div>
                        )}
                        {s.bosses.length > 0 && (
                          <div style={{ maxWidth: 180 }}>
                            <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>BOSSES</div>
                            <div style={{ fontSize: 10, color: 'var(--ink-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.bosses.slice(0, 2).join(', ')}{s.bosses.length > 2 ? ` +${s.bosses.length - 2}` : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <SectionDiv num="06">Inflation Index</SectionDiv>
        {(() => {
          const maxScore = period?.total_max_score;
          const pct = maxScore ? ((( period?.total_score || 0) / maxScore) * 100).toFixed(1) : null;
          const best = period?.runs?.reduce((b, r) => r.score > (b?.score ?? 0) ? r : b, null as RunExt | null);
          return (
            <InflationIndexPanel
              headline={pct ? `${pct}%` : '—'}
              headlineLabel={maxScore ? `of ${fmtNum(maxScore)} point ceiling reached` : 'of ceiling reached'}
              color="var(--hot)"
              narrative={<>
                Cycle total: <span className="tabular" style={{ color: 'var(--tape)' }}>{fmtNum(period?.total_score)}</span>.
                {' '}Top <span style={{ color: 'var(--hot)' }}>{((period?.rank_percent || 0) / 100).toFixed(2)}%</span> of servers.
                {best ? <> Best run: <span style={{ color: 'var(--tape)' }}>{best.boss[0]?.name || 'Unknown'}</span> — <span className="tabular" style={{ color: 'var(--tape)' }}>{fmtNum(best.score)}</span>.</> : null}
              </>}
            />
          );
        })()}
      </div>

      {runModal && <RunModal run={runModal} onClose={() => setRunModal(null)} onAgent={onAgent} />}
    </div>
  );
}

function RunModal({ run, onClose, onAgent }: { run: RunExt; onClose: () => void; onAgent: (a: AvatarInfo) => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--hot)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="rating" style={{ background: 'var(--hot)' }}>{run.star}★</div>
          <div style={{ flex: 1 }}>
            <div className="hairline">DEADLY ASSAULT · {fmtTs(run.challenge_time)}</div>
            <div className="display" style={{ fontSize: 22 }}>{run.boss[0]?.name}</div>
          </div>
          <button className="btn" onClick={onClose}>✕ CLOSE</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <Stat label="Score" value={fmtNum(run.score)} accent />
            <Stat label="Stars" value={`${run.star}/${run.total_star ?? 3}★`} />
            <Stat label="Cleared" value={fmtTs(run.challenge_time)} />
          </div>
          <div className="hairline" style={{ marginBottom: 12 }}>SQUAD</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {run.avatars.map((a, i) => {
              const ae = a as AvatarExt;
              return (
                <div key={i} className="panel" style={{ cursor: 'pointer' }} onClick={() => onAgent(a)}>
                  <div style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Agent a={a} size="lg" />
                    <div>
                      <div className="hairline">AGT-{a.id}</div>
                      {ae.level && <div className="display" style={{ fontSize: 16 }}>Lv {ae.level}</div>}
                      <div className="hairline" style={{ color: elementInfo(a.element).color, marginTop: 4 }}>{elementInfo(a.element).name}</div>
                      <div className="hairline">{professionName(a.profession)}</div>
                      {a.rank > 0 && <div style={{ marginTop: 4 }}><span className="sticker dark">M{a.rank}</span></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {run.buffer?.[0] && (
            <div className="panel">
              <div className="panel-header">
                <span className="dot" />
                <span className="hairline">⚡ {run.buffer[0].name}</span>
              </div>
              {run.buffer[0].desc && (
                <div className="panel-body" style={{ whiteSpace: 'pre-line', fontSize: 13, color: 'var(--ink-dim)' }}>
                  {cleanText(run.buffer[0].desc)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

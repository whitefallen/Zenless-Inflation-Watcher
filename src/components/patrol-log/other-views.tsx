'use client';
import React, { useState } from 'react';
import { Sticker, Stat, SectionDiv, PeriodScrubber, Agent, Team, InflationIndexPanel, fmtNum, fmtDateRange, elementInfo, professionName } from './shared';
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

export function VoidFrontView({ data, onAgent }: { data: ZZZData; onAgent: (a: AvatarInfo) => void }) {
  const vf = data.voidFront[0];
  if (!vf) return <div className="empty">No Void Front data.</div>;
  const main = (vf as unknown as Record<string, unknown>).main as Record<string, unknown> | undefined;
  const subs = (main?.sub_challenges as unknown[]) || [];

  return (
    <div className="fade-up">
      <div className="slice" style={{ padding: '32px', borderBottom: '2px solid var(--line)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Sticker variant="cyan">VOID // FRONT</Sticker>
            <span className="hairline">EXPEDITION LOG</span>
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
        {/* Boss record */}
        {vf.boss && (
          <>
            <SectionDiv num="01">Target Record</SectionDiv>
            <div className="panel">
              <div className="panel-body" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div>
                    <div className="hairline" style={{ marginBottom: 8 }}>BOSS TARGET</div>
                    <div className="display" style={{ fontSize: 36 }}>{vf.boss.name}</div>
                    <div className="hairline" style={{ marginTop: 8 }}>ID #{vf.boss.id}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sub-challenges */}
        {subs.length > 0 && (
          <>
            <SectionDiv num="02">Sub-Challenges</SectionDiv>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }} className="panel-grid">
              {subs.map((s: unknown, i: number) => {
                const sub = s as Record<string, unknown>;
                return (
                  <div key={i} className="panel relative">
                    <div className="corner-tag">{i + 1}</div>
                    <div style={{ padding: 14 }}>
                      <div className="hairline" style={{ marginBottom: 6 }}>{sub.name as string || `Challenge ${i + 1}`}</div>
                      <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 22, color: 'var(--cyan)', marginBottom: 8 }}>
                        {fmtNum(sub.score as number)}
                      </div>
                      {sub.score_ratio != null && (
                        <div className="hairline" style={{ marginBottom: 8 }}>{sub.score_ratio as number}× ratio</div>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
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

        <SectionDiv num="03">Inflation Index</SectionDiv>
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

export function DeadlyView({ data, onAgent }: { data: ZZZData; onAgent: (a: AvatarInfo) => void }) {
  const periods = data.deadlyAssault as unknown as DAExt[];
  const [activeIdx, setActiveIdx] = useState(periods.length - 1);
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
        <div className="panel">
          <div className="panel-header">
            <span className="dot" />
            <span className="hairline">SCORE PER CYCLE · {periods.length} POINTS</span>
          </div>
          <div className="panel-body" style={{ padding: '24px 8px 8px 8px' }}>
            <AreaLineChart data={trendData} height={chartH} color="#FF3D2E" yKey="score" formatY={v => (v / 1000).toFixed(0) + 'k'} />
          </div>
        </div>

        <SectionDiv num="02">Cycle Scrubber</SectionDiv>
        <PeriodScrubber
          periods={periods.map(p => ({
            id: fmtTsShortAny(p.start_time || p.begin_time),
            label: 'CYC',
            score: p.total_score,
          }))}
          active={activeIdx}
          onPick={setActiveIdx}
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

        <SectionDiv num="05">Inflation Index</SectionDiv>
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

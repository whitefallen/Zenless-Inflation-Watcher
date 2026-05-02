'use client';
import React, { useState } from 'react';
import { Sticker, Stat, SectionDiv, PeriodScrubber, Agent, InflationIndexPanel, fmtNum, fmtTsShort, fmtDateRange, ratingClass, elementInfo, professionName } from './shared';
import { AreaLineChart, useChartH } from './charts';
import type { ZZZData, AvatarInfo, ShiyuLayer, ShiyuPeriod } from './types';

function fmtTs(ts: unknown): string {
  if (!ts || typeof ts !== 'object') return '—';
  const t = ts as Record<string, number>;
  const m = String(t.month).padStart(2, '0');
  const d = String(t.day).padStart(2, '0');
  return `${t.year}-${m}-${d}`;
}

type LayerExt = ShiyuLayer & {
  buffer?: { title?: string; text?: string };
  max_score?: number;
  buddy?: { id?: number; rarity?: string; level?: number; url?: string };
};
type AvatarExt = AvatarInfo & { level?: number };

export function ShiyuView({ data, onAgent }: { data: ZZZData; onAgent: (a: AvatarInfo) => void }) {
  const periods = data.shiyu;
  const [activeIdx, setActiveIdx] = useState(periods.length - 1);
  const [filterChar, setFilterChar] = useState<number | null>(null);
  const [layerModal, setLayerModal] = useState<LayerExt | null>(null);
  const chartH = useChartH(220, 160);
  const period = periods[activeIdx] as ShiyuPeriod & { brief: ShiyuPeriod['brief'] & { max_score?: number; cur_period_zone_layer_count?: number } };

  const trendData = periods.map(p => ({
    label: '#' + String(p.zone_id).slice(-3),
    score: p.brief?.score || 0,
    rank: (p.brief?.rank_percent || 0) / 100,
  }));

  const layers = (period?.layers || []) as LayerExt[];
  const bestLayer = layers.reduce((b, L) => !b || L.score > b.score ? L : b, null as LayerExt | null);

  const charsInPeriod: Record<number, AvatarInfo & { count: number }> = {};
  layers.forEach(L => L.avatars.forEach(a => {
    charsInPeriod[a.id] = charsInPeriod[a.id] || { ...a, count: 0 };
    charsInPeriod[a.id].count++;
  }));
  const periodChars = Object.values(charsInPeriod).sort((a, b) => b.count - a.count);

  return (
    <div className="fade-up">
      <div className="slice" style={{ padding: '32px', borderBottom: '2px solid var(--line)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Sticker>SHIYU // HADAL BLACKSITE</Sticker>
            <span className="hairline">DOSSIER · CYCLE {period?.zone_id}</span>
            <span className="hairline" style={{ marginLeft: 'auto' }}>{fmtDateRange(period?.begin, period?.end)}</span>
          </div>
          <div className="kinetic" style={{ fontSize: 'clamp(40px, 6vw, 72px)', marginBottom: 16 }}>
            SHIYU <span className="stroke">DEFENSE</span>
          </div>
          <div style={{ maxWidth: 640, color: 'var(--ink-dim)', fontSize: 14, marginBottom: 24 }}>
            Five-floor blacksite gauntlet. Score-based. Three teams per floor, one buff in play.
            v2 schema. The fifth floor is the maker.
          </div>
          <div className="rg-5">
            <Stat large label="Cycle Score" value={fmtNum(period?.brief?.score)} sub={period?.brief?.max_score ? `/ ${fmtNum(period.brief.max_score)} cap` : undefined} accent />
            <Stat label="Rating" value={period?.brief?.rating || '—'} sub={period?.pass5 ? '5F CLEARED' : '5F LOCKED'} />
            <Stat label="Server Rank" value={`Top ${((period?.brief?.rank_percent || 0) / 100).toFixed(2)}%`} sub="of ranked servers" />
            <Stat label="Floors Logged" value={String(period?.brief?.cur_period_zone_layer_count ?? layers.length)} sub="of 5 critical" />
            <Stat label="Best Floor" value={fmtNum(bestLayer?.score)} sub={bestLayer ? `Layer …${String(bestLayer.layer_id).slice(-2)}` : '—'} />
          </div>
        </div>
      </div>

      <div className="view-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px 64px' }}>
        <SectionDiv num="01">Inflation Curve</SectionDiv>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-header">
              <span className="dot" />
              <span className="hairline">SCORE PER CYCLE</span>
              <span className="hairline" style={{ marginLeft: 'auto' }}>HOVER FOR DETAIL</span>
            </div>
            <div className="panel-body" style={{ padding: '24px 8px 8px 8px' }}>
              <AreaLineChart data={trendData} height={chartH} color="#FFD400" yKey="score" formatY={v => (v / 1000).toFixed(0) + 'k'} />
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">
              <span className="dot" />
              <span className="hairline">SERVER RANK % OVER TIME</span>
            </div>
            <div className="panel-body" style={{ padding: '24px 8px 8px 8px' }}>
              <AreaLineChart data={trendData} height={chartH} color="#2BE0FF" yKey="rank" formatY={v => v.toFixed(2) + '%'} />
            </div>
          </div>
        </div>

        <SectionDiv num="02">Cycle Scrubber</SectionDiv>
        <PeriodScrubber
          periods={periods.map(p => ({ id: p.zone_id, label: fmtTsShort(p.begin), score: p.brief?.score }))}
          active={activeIdx}
          onPick={setActiveIdx}
        />

        <SectionDiv num="03">Floor Ledger</SectionDiv>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="panel-grid">
          {layers.map((L, i) => (
            <FloorCard key={i} layer={L} idx={i} onOpen={() => setLayerModal(L)} filterChar={filterChar} />
          ))}
        </div>

        <SectionDiv num="04">Agent Deployment · This Cycle</SectionDiv>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" />
            <span className="hairline">{periodChars.length} UNIQUE AGENTS · CLICK TO FILTER</span>
            {filterChar && (
              <button className="btn ghost" onClick={() => setFilterChar(null)} style={{ marginLeft: 'auto', fontSize: 10, padding: '4px 8px' }}>✕ CLEAR</button>
            )}
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {periodChars.map((c, i) => (
                <div key={i}
                  onClick={() => setFilterChar(filterChar === c.id ? null : c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: 8,
                    background: filterChar === c.id ? 'var(--asphalt-3)' : 'var(--asphalt)',
                    border: '1.5px solid', borderColor: filterChar === c.id ? 'var(--tape)' : 'var(--line)',
                    cursor: 'pointer',
                  }}>
                  <Agent a={c} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hairline" style={{ fontSize: 9, color: elementInfo(c.element).color }}>{elementInfo(c.element).short}</div>
                    <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 14, color: 'var(--tape)' }}>×{c.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionDiv num="05">Server Inflation Index</SectionDiv>
        <InflationIndexPanel
          headline={period?.brief?.max_score ? `${((period.brief.score / period.brief.max_score) * 100).toFixed(1)}%` : '—'}
          headlineLabel="of cycle ceiling reached"
          narrative={<>
            Cycle <span className="tabular" style={{ color: 'var(--tape)' }}>#{period?.zone_id}</span>:
            scored <span className="tabular" style={{ color: 'var(--tape)' }}>{fmtNum(period?.brief?.score)}</span> on the Hadal Blacksite.
            Top <span style={{ color: 'var(--tape)' }}>{((period?.brief?.rank_percent || 0) / 100).toFixed(2)}%</span> of servers. Floor-five clear
            {period?.pass5
              ? <> <span style={{ color: 'var(--tape)' }}>confirmed</span> — patrol logged.</>
              : <> <span style={{ color: 'var(--hot)' }}>pending</span> — recon needed.</>
            }
          </>}
        />
      </div>

      {layerModal && (
        <LayerModal layer={layerModal} period={period} onClose={() => setLayerModal(null)} onAgent={onAgent} />
      )}
    </div>
  );
}

function FloorCard({ layer, idx, onOpen, filterChar }: {
  layer: LayerExt; idx: number;
  onOpen: () => void; filterChar: number | null;
}) {
  const dim = filterChar !== null && !layer.avatars.some(a => a.id === filterChar);
  const buffer = layer.buffer || {};
  const completion = layer.score && layer.max_score ? Math.min(100, (layer.score / layer.max_score) * 100) : 60;

  return (
    <div className="panel relative" style={{ cursor: 'pointer', opacity: dim ? 0.35 : 1 }}
      onClick={onOpen}
      onMouseEnter={e => !dim && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--tape)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--line)')}
    >
      <div className="corner-tag">F{idx + 1}</div>
      <div style={{ padding: 14 }}>
        <div className="hairline">FLOOR · {String(layer.layer_id).slice(-2)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 12px' }}>
          <div className={`rating ${ratingClass(layer.rating)}`} style={{ width: 28, height: 28, fontSize: 14 }}>{layer.rating}</div>
          <div className="tabular" style={{ fontFamily: 'Archivo Black', fontSize: 18, color: 'var(--tape)' }}>{fmtNum(layer.score)}</div>
        </div>
        <div style={{ height: 6, background: 'var(--asphalt-3)', position: 'relative', marginBottom: 12, border: '1px solid var(--line)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${completion}%`, background: 'var(--tape)' }} />
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {layer.avatars.slice(0, 3).map((a, i) => <Agent key={i} a={a} size="sm" />)}
        </div>
        {buffer.title && (
          <div className="hairline" style={{ fontSize: 9, color: 'var(--ink-faint)' }}>
            ⚡ {buffer.title.slice(0, 22)}{buffer.title.length > 22 ? '…' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

function LayerModal({ layer, period, onClose, onAgent }: {
  layer: LayerExt; period: ShiyuPeriod;
  onClose: () => void; onAgent: (a: AvatarInfo) => void;
}) {
  const buffer = layer.buffer || {};
  const cleanText = (buffer.text || '').replace(/<color=#[0-9A-F]+>/gi, '').replace(/<\/color>/gi, '').replace(/\\n/g, '\n');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--tape)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className={`rating ${ratingClass(layer.rating)}`}>{layer.rating}</div>
          <div style={{ flex: 1 }}>
            <div className="hairline">CYCLE {period?.zone_id} · LAYER {String(layer.layer_id).slice(-2)}</div>
            <div className="display" style={{ fontSize: 24 }}>{buffer.title || 'Hadal Floor'}</div>
          </div>
          <button className="btn" onClick={onClose}>✕ CLOSE</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <Stat label="Score" value={fmtNum(layer.score)} sub={layer.max_score ? `/ ${fmtNum(layer.max_score)} max` : undefined} accent />
            <Stat label="Cleared" value={fmtTs(layer.challenge_time)} />
            <Stat label="Completion" value={layer.max_score ? `${((layer.score / layer.max_score) * 100).toFixed(1)}%` : '—'} />
          </div>
          {cleanText && (
            <div className="panel" style={{ marginBottom: 24 }}>
              <div className="panel-header">
                <span className="dot" />
                <span className="hairline">FIELD MODIFIER · {buffer.title}</span>
              </div>
              <div className="panel-body" style={{ whiteSpace: 'pre-line', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-dim)' }}>
                {cleanText}
              </div>
            </div>
          )}
          <div className="hairline" style={{ marginBottom: 12 }}>SQUAD · {layer.avatars.length} AGENTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {layer.avatars.map((a, i) => {
              const ae = a as AvatarExt;
              return (
                <div key={i} className="panel" style={{ cursor: 'pointer' }} onClick={() => onAgent(a)}>
                  <div style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Agent a={a} size="lg" />
                    <div style={{ flex: 1 }}>
                      <div className="hairline">AGT-{a.id}</div>
                      {ae.level && <div className="display" style={{ fontSize: 18 }}>Lv {ae.level}</div>}
                      <div className="hairline" style={{ color: elementInfo(a.element).color, marginTop: 4 }}>{elementInfo(a.element).name} · {professionName(a.profession)}</div>
                      {a.rank > 0 && <div style={{ marginTop: 4 }}><span className="sticker dark">M{a.rank}</span></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

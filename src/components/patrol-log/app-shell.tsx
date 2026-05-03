'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar, Agent, Stat, elementInfo, professionName } from './shared';
import { Dashboard } from './dashboard';
import { ShiyuView } from './shiyu';
import { VoidFrontView, DeadlyView } from './other-views';
import type { ZZZData, AvatarInfo, ShiyuPeriod, DeadlyAssaultPeriod, VoidFrontPeriod } from './types';

const VALID_VIEWS = ['dashboard', 'shiyu', 'deadly', 'voidfront'];

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Map from view name to the JSON file it needs and the ZZZData key it populates. */
const VIEW_FILES: Record<string, { file: string; key: keyof ZZZData }> = {
  shiyu:     { file: `${BASE}/data/zzz-shiyu.json`,    key: 'shiyu' },
  deadly:    { file: `${BASE}/data/zzz-deadly.json`,   key: 'deadlyAssault' },
  voidfront: { file: `${BASE}/data/zzz-voidfront.json`, key: 'voidFront' },
};

const DASHBOARD_DEPS = ['shiyu', 'deadly', 'voidfront'] as const;

/**
 * Parse `#view` or `#view/periodId` from the URL hash.
 * Returns `{ view, periodId }` — periodId is a number if present, else null.
 */
function parseHash(raw: string): { view: string; periodId: number | null } {
  const [viewPart, idPart] = raw.replace(/^#/, '').split('/');
  const view = VALID_VIEWS.includes(viewPart) ? viewPart : 'dashboard';
  const periodId = idPart ? parseInt(idPart, 10) || null : null;
  return { view, periodId };
}

export function PatrolLogApp() {
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') return parseHash(window.location.hash).view;
    return 'dashboard';
  });
  const [initialPeriodId, setInitialPeriodId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') return parseHash(window.location.hash).periodId;
    return null;
  });

  const [shiyuData,  setShiyuData]  = useState<ShiyuPeriod[] | null>(null);
  const [daData,     setDaData]     = useState<DeadlyAssaultPeriod[] | null>(null);
  const [vfData,     setVfData]     = useState<VoidFrontPeriod[] | null>(null);

  const loadingRef = useRef<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [agentModal, setAgentModal] = useState<AvatarInfo | null>(null);

  const loadSlice = useCallback((v: string) => {
    if (!(v in VIEW_FILES)) return;
    if (loadingRef.current.has(v)) return;
    loadingRef.current.add(v);
    const { file, key } = VIEW_FILES[v];
    fetch(file)
      .then(r => { if (!r.ok) throw new Error(`${r.status} ${file}`); return r.json(); })
      .then((d: Partial<ZZZData>) => {
        if (key === 'shiyu')              setShiyuData(d.shiyu ?? null);
        else if (key === 'deadlyAssault') setDaData(d.deadlyAssault ?? null);
        else if (key === 'voidFront')     setVfData(d.voidFront ?? null);
      })
      .catch(() => setError(`Failed to load ${v} patrol data.`));
  }, []);

  useEffect(() => {
    if (view === 'dashboard') DASHBOARD_DEPS.forEach(loadSlice);
    else loadSlice(view);
  }, [view, loadSlice]);

  /**
   * Navigate to a view, optionally pinning a specific period.
   * Writes `#view` or `#view/periodId` to the URL.
   */
  const goTo = useCallback((next: string, pid?: number | null) => {
    const [nextView] = next.split('/');
    if (nextView === view && pid == null) return;
    const hash = pid != null ? `${nextView}/${pid}` : nextView;
    window.location.hash = hash;
    setView(nextView);
    setInitialPeriodId(pid ?? null);
    window.scrollTo(0, 0);
  }, [view]);

  // Browser back/forward — re-parse the hash on every hashchange.
  useEffect(() => {
    const onHash = () => {
      const { view: v, periodId } = parseHash(window.location.hash);
      setView(v);
      setInitialPeriodId(periodId);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const allDataReady = shiyuData || daData || vfData;
  useEffect(() => {
    if (!allDataReady) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    setTimeout(() => {
      document.querySelectorAll('.panel:not(.in-view)').forEach(el => {
        el.classList.add('reveal-on-view'); obs.observe(el);
      });
    }, 100);
    return () => obs.disconnect();
  }, [allDataReady, view]);

  const data: ZZZData = {
    shiyu:         shiyuData  ?? [],
    deadlyAssault: daData     ?? [],
    voidFront:     vfData     ?? [],
  };

  const viewReady =
    view === 'dashboard' ? (!!shiyuData && !!daData && !!vfData)
    : view === 'shiyu'     ? !!shiyuData
    : view === 'deadly'    ? !!daData
    : view === 'voidfront' ? !!vfData
    : false;

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div className="hairline" style={{ color: 'var(--hot)' }}>◤ PATROL DATA UNAVAILABLE ◢</div>
      <div style={{ color: 'var(--ink-dim)', fontSize: 13 }}>{error}</div>
    </div>
  );

  if (!viewReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hairline pulse">◤ LOADING PATROL DATA ◢</div>
    </div>
  );

  return (
    <>
      <TopBar active={view} onNav={goTo} />
      <div key={view + String(initialPeriodId)} className="view-entering">
        {view === 'dashboard'  && <Dashboard  data={data} onNav={goTo} />}
        {view === 'shiyu'      && <ShiyuView  data={data} onAgent={setAgentModal} initialPeriodId={initialPeriodId} onPeriodChange={pid => goTo('shiyu', pid)} />}
        {view === 'voidfront'  && <VoidFrontView data={data} onAgent={setAgentModal} initialPeriodId={initialPeriodId} onPeriodChange={pid => goTo('voidfront', pid)} />}
        {view === 'deadly'     && <DeadlyView data={data} onAgent={setAgentModal} initialPeriodId={initialPeriodId} onPeriodChange={pid => goTo('deadly', pid)} />}
      </div>

      {agentModal && (
        <div className="modal-backdrop" onClick={() => setAgentModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--tape)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Agent a={agentModal} size="lg" />
              <div style={{ flex: 1 }}>
                <div className="hairline">AGENT DOSSIER</div>
                <div className="display" style={{ fontSize: 22 }}>AGT-{agentModal.id}</div>
              </div>
              <button className="btn" onClick={() => setAgentModal(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <Stat label="Element" value={elementInfo(agentModal.element).name} />
                <Stat label="Profession" value={professionName(agentModal.profession)} />
                <Stat label="Rarity" value={agentModal.rarity} />
                <Stat label="Mindscape" value={`M${agentModal.rank}`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

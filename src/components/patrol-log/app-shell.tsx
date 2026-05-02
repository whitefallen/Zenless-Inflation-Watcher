'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar, Agent, Stat, elementInfo, professionName } from './shared';
import { Dashboard } from './dashboard';
import { ShiyuView } from './shiyu';
import { VoidFrontView, DeadlyView } from './other-views';
import type { ZZZData, AvatarInfo, ShiyuPeriod, DeadlyAssaultPeriod, VoidFrontPeriod } from './types';

const VALID_VIEWS = ['dashboard', 'shiyu', 'deadly', 'voidfront'];

/** Map from view name to the JSON file it needs and the ZZZData key it populates. */
const VIEW_FILES: Record<string, { file: string; key: keyof ZZZData }> = {
  shiyu:     { file: '/data/zzz-shiyu.json',    key: 'shiyu' },
  deadly:    { file: '/data/zzz-deadly.json',   key: 'deadlyAssault' },
  voidfront: { file: '/data/zzz-voidfront.json', key: 'voidFront' },
};

/** Views that are needed to render the dashboard. */
const DASHBOARD_DEPS = ['shiyu', 'deadly', 'voidfront'] as const;

export function PatrolLogApp() {
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (VALID_VIEWS.includes(hash)) return hash;
    }
    return 'dashboard';
  });

  // Per-key data parts — loaded independently.
  const [shiyuData,  setShiyuData]  = useState<ShiyuPeriod[] | null>(null);
  const [daData,     setDaData]     = useState<DeadlyAssaultPeriod[] | null>(null);
  const [vfData,     setVfData]     = useState<VoidFrontPeriod[] | null>(null);

  const loadingRef = useRef<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [agentModal, setAgentModal] = useState<AvatarInfo | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Fetch a single view-slice and populate the appropriate state.
  const loadSlice = useCallback((v: string) => {
    if (!(v in VIEW_FILES)) return;
    if (loadingRef.current.has(v)) return;
    loadingRef.current.add(v);

    const { file, key } = VIEW_FILES[v];
    fetch(file)
      .then(r => { if (!r.ok) throw new Error(`${r.status} ${file}`); return r.json(); })
      .then((d: Partial<ZZZData>) => {
        if (key === 'shiyu')          setShiyuData(d.shiyu ?? null);
        else if (key === 'deadlyAssault') setDaData(d.deadlyAssault ?? null);
        else if (key === 'voidFront') setVfData(d.voidFront ?? null);
      })
      .catch(() => setError(`Failed to load ${v} patrol data.`));
  }, []);

  // On mount and on view change, trigger the right fetches.
  useEffect(() => {
    if (view === 'dashboard') {
      // Dashboard needs all three — kick them off in parallel.
      DASHBOARD_DEPS.forEach(loadSlice);
    } else {
      // Specific view: load just what it needs.
      loadSlice(view);
    }
  }, [view, loadSlice]);

  const goTo = useCallback((next: string) => {
    if (next === view) return;
    window.location.hash = next;
    setNavigating(true);
    setTimeout(() => {
      setView(next);
      window.scrollTo(0, 0);
      setNavigating(false);
    }, 220);
  }, [view]);

  // Browser back/forward via hash change.
  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (VALID_VIEWS.includes(hash)) { setView(hash); window.scrollTo(0, 0); }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Scroll-reveal IntersectionObserver.
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
        el.classList.add('reveal-on-view');
        obs.observe(el);
      });
    }, 100);
    return () => obs.disconnect();
  }, [allDataReady, view]);

  // Build a ZZZData object from whatever is currently loaded.
  // Views only use their own key, so empty fallbacks are safe for non-loaded slices.
  const data: ZZZData = {
    shiyu:           shiyuData  ?? [],
    deadlyAssault:   daData     ?? [],
    voidFront:       vfData     ?? [],
  };

  // Determine whether the currently displayed view has its data.
  const viewReady =
    view === 'dashboard' ? (!!shiyuData && !!daData && !!vfData)
    : view === 'shiyu'     ? !!shiyuData
    : view === 'deadly'    ? !!daData
    : view === 'voidfront' ? !!vfData
    : false;

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="hairline" style={{ color: 'var(--hot)' }}>◤ PATROL DATA UNAVAILABLE ◢</div>
        <div style={{ color: 'var(--ink-dim)', fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  if (!viewReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="hairline pulse">◤ LOADING PATROL DATA ◢</div>
      </div>
    );
  }

  return (
    <>
      <TopBar active={view} onNav={goTo} />
      <div key={view} className={navigating ? 'view-leaving' : 'view-entering'}>
        {view === 'dashboard'  && <Dashboard  data={data} onNav={goTo} />}
        {view === 'shiyu'      && <ShiyuView  data={data} onAgent={setAgentModal} />}
        {view === 'voidfront'  && <VoidFrontView data={data} onAgent={setAgentModal} />}
        {view === 'deadly'     && <DeadlyView data={data} onAgent={setAgentModal} />}
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

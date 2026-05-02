'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { TopBar, Agent, Stat, elementInfo, professionName } from './shared';
import { Dashboard } from './dashboard';
import { ShiyuView } from './shiyu';
import { VoidFrontView, DeadlyView } from './other-views';
import type { ZZZData, AvatarInfo } from './types';

export function PatrolLogApp() {
  const [data, setData] = useState<ZZZData | null>(null);
  const [view, setView] = useState('dashboard');
  const [agentModal, setAgentModal] = useState<AvatarInfo | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/zzz-data.json')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load patrol data.'));
  }, []);

  const goTo = useCallback((next: string) => {
    if (next === view) return;
    setNavigating(true);
    setTimeout(() => {
      setView(next);
      window.scrollTo(0, 0);
      setNavigating(false);
    }, 220);
  }, [view]);

  useEffect(() => {
    if (!data) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    setTimeout(() => {
      document.querySelectorAll('.panel:not(.in-view)').forEach(el => {
        el.classList.add('reveal-on-view');
        obs.observe(el);
      });
    }, 100);
    return () => obs.disconnect();
  }, [data, view]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="hairline" style={{ color: 'var(--hot)' }}>◤ PATROL DATA UNAVAILABLE ◢</div>
        <div style={{ color: 'var(--ink-dim)', fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  if (!data) {
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

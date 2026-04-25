"use client";

import { VoidFrontData } from "@/types/void-front";
import Image from "next/image";
import { percentile } from "@/lib/utils";
import { formatTimeStamp } from "@/lib/date-utils";
import { getAgentInfoClient as getAgentInfo } from "@/lib/grade-utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface VfAnalyticsProps {
  data: VoidFrontData[];
}

const ELEMENT_COLORS: Record<number, string> = {
  200: "#f5c842", // Physical
  201: "#60a5fa", // Ice
  202: "#f97316", // Fire
  203: "#a855f7", // Ether
  204: "#22c55e", // Electric
  205: "#ef4444", // Anomaly / Fire-red
};

const STAR_COLORS: Record<string, string> = {
  S: "#f5c842",
  A: "#00d4ff",
  B: "#a855f7",
  C: "#f97316",
};

function scoreColor(pct: number): string {
  if (pct >= 90) return "#f5c842";
  if (pct >= 70) return "#00d4ff";
  if (pct >= 50) return "#a855f7";
  return "#6b7280";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="text-xs text-[#e8e0cc] px-3 py-2"
      style={{
        background: "#0d0f17",
        border: "1px solid rgba(168,85,247,0.3)",
        clipPath: "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))",
      }}
    >
      <div className="font-bold text-[#a855f7] mb-1">{label}</div>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export function VfAnalytics({ data }: VfAnalyticsProps) {
  const valid = data.filter((d) => d?.data?.void_front_battle_abstract_info_brief);

  if (valid.length === 0) {
    return (
      <div
        className="p-6 text-center text-[#6b7280] text-sm"
        style={{
          background: "rgba(168,85,247,0.04)",
          border: "1px solid rgba(168,85,247,0.15)",
          clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
        }}
      >
        No Void Front data available yet.
      </div>
    );
  }

  // Sort oldest → newest for charts
  const sorted = [...valid].reverse();
  const latest = valid[0];
  const brief = latest.data.void_front_battle_abstract_info_brief;
  const bossInfo = latest.data.boss_challenge_record?.boss_info;
  const bossMain = latest.data.boss_challenge_record?.main_challenge_record;
  const challenges = latest.data.main_challenge_record_list ?? [];

  const scorePercent = brief.max_score > 0 ? (brief.total_score / brief.max_score) * 100 : 0;

  // Score trend across all seasons
  const trendData = sorted.map((d) => {
    const b = d.data.void_front_battle_abstract_info_brief;
    const first = d.data.main_challenge_record_list?.[0]?.challenge_time;
    const label = first ? `${first.month}/${first.day}` : `#${b.void_front_id}`;
    return {
      label,
      score: b.total_score,
      max: b.max_score,
      pct: b.max_score > 0 ? Math.round((b.total_score / b.max_score) * 100) : 0,
    };
  });

  // Per-challenge score bars (latest season)
  const challengeBarData = [
    ...challenges.map((c) => ({
      name: c.name,
      score: c.score,
      max: c.max_score,
      star: c.star,
      pct: c.max_score > 0 ? Math.round((c.score / c.max_score) * 100) : 0,
    })),
    ...(bossMain
      ? [
          {
            name: bossMain.name || "LAST NODE",
            score: bossMain.score,
            max: bossMain.max_score,
            star: bossMain.star,
            pct: bossMain.max_score > 0 ? Math.round((bossMain.score / bossMain.max_score) * 100) : 0,
          },
        ]
      : []),
  ];

  // Agent usage across all seasons
  const agentMap = new Map<number, { url: string; count: number; element: number; rarity: string }>();
  for (const d of valid) {
    const allChallenges = [
      ...(d.data.main_challenge_record_list ?? []),
      ...(d.data.boss_challenge_record?.main_challenge_record
        ? [d.data.boss_challenge_record.main_challenge_record]
        : []),
    ];
    for (const c of allChallenges) {
      for (const a of c.avatar_list ?? []) {
        const existing = agentMap.get(a.id);
        if (existing) {
          existing.count++;
        } else {
          agentMap.set(a.id, {
            url: a.role_square_url,
            count: 1,
            element: a.element_type,
            rarity: a.rarity,
          });
        }
      }
    }
  }
  const agentUsage = Array.from(agentMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12);

  const accentColor = "#a855f7";
  const accentDim = "rgba(168,85,247,0.08)";
  const accentBorder = "rgba(168,85,247,0.2)";

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Score",
            value: brief.total_score.toLocaleString(),
            sub: `/ ${brief.max_score.toLocaleString()}`,
            accent: scoreColor(scorePercent),
          },
          {
            label: "Score %",
            value: `${scorePercent.toFixed(1)}%`,
            sub: "of max",
            accent: scoreColor(scorePercent),
          },
          {
            label: "Rank Percentile",
            value: brief.rank_percent !== undefined ? percentile(brief.rank_percent) : "N/A",
            sub: "global",
            accent: accentColor,
          },
          {
            label: "Ending",
            value: brief.ending_record_name
              ? `#${brief.ending_record_id}`
              : "—",
            sub: brief.ending_record_name?.replace(/^Ending \d+: /, "") ?? "None",
            accent: "#00d4ff",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 flex flex-col gap-1"
            style={{
              background: accentDim,
              border: `1px solid ${accentBorder}`,
              clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
            }}
          >
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
              {kpi.label}
            </span>
            <span className="text-xl font-black" style={{ color: kpi.accent }}>
              {kpi.value}
            </span>
            <span className="text-[11px] text-[#6b7280]">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Score progress bar */}
      <div
        className="p-4"
        style={{
          background: accentDim,
          border: `1px solid ${accentBorder}`,
          clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
            Score Progress
          </span>
          <span className="text-xs font-bold" style={{ color: scoreColor(scorePercent) }}>
            {scorePercent.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-[#1e2438] relative" style={{ clipPath: "polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))" }}>
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${scorePercent}%`,
              background: `linear-gradient(90deg, ${scoreColor(scorePercent)}66, ${scoreColor(scorePercent)})`,
              boxShadow: `0 0 8px ${scoreColor(scorePercent)}`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#6b7280] mt-1">
          <span>0</span>
          <span>{brief.max_score.toLocaleString()}</span>
        </div>
      </div>

      {/* Score trend (only if >1 season) */}
      {trendData.length > 1 && (
        <div
          className="p-4"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
              Score Trend
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="vfScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke={accentColor}
                strokeWidth={2}
                fill="url(#vfScoreGrad)"
                dot={{ fill: accentColor, r: 3, strokeWidth: 0 }}
                name="Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Boss info + per-challenge breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Boss card */}
        {bossInfo && bossMain && (
          <div
            className="p-4 flex flex-col gap-3"
            style={{
              background: accentDim,
              border: `1px solid ${accentBorder}`,
              clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
                Final Boss
              </span>
            </div>
            <div className="flex items-center gap-3">
              {bossInfo.icon && (
                <Image src={bossInfo.icon} alt="Boss" width={48} height={48} unoptimized className="shrink-0" />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-black text-[#e8e0cc]">{bossInfo.name}</span>
                <span className="text-xs text-[#6b7280]">
                  Score: {bossMain.score.toLocaleString()} / {bossMain.max_score.toLocaleString()}
                  <span className="ml-2 text-[#f5c842]">×{bossMain.score_ratio}</span>
                </span>
              </div>
              <span
                className="ml-auto text-2xl font-black"
                style={{ color: STAR_COLORS[bossMain.star] ?? "#6b7280" }}
              >
                {bossMain.star}
              </span>
            </div>
            {/* boss team */}
            <div className="flex gap-2 flex-wrap mt-1">
              {(bossMain.avatar_list ?? []).map((a) => {
                const info = getAgentInfo(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                const url = info?.iconUrl ?? a.role_square_url;
                const elemColor = ELEMENT_COLORS[a.element_type] ?? "#6b7280";
                return (
                  <div key={a.id} className="relative" title={info?.name ?? `Agent ${a.id}`}>
                    <div
                      className="w-10 h-10 overflow-hidden"
                      style={{
                        border: `1px solid ${elemColor}66`,
                        clipPath: "polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))",
                      }}
                    >
                      <Image src={url ?? "/placeholder.png"} alt={info?.name ?? ""} width={40} height={40} unoptimized />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 text-[8px] font-black px-0.5"
                      style={{ background: elemColor, color: "#08090d" }}
                    >
                      {a.rarity}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* buff */}
            {bossMain.buffer?.name && (
              <div className="text-[11px] text-[#6b7280] mt-1 border-t border-[#1e2438] pt-2">
                <span className="text-[#a855f7] font-bold">Buff:</span> {bossMain.buffer.name}
              </div>
            )}
            {bossMain.challenge_time && (
              <div className="text-[10px] text-[#6b7280]">
                Completed: {formatTimeStamp(bossMain.challenge_time)}
              </div>
            )}
          </div>
        )}

        {/* Per-challenge bar chart */}
        <div
          className="p-4"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
              Node Scores (Latest)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={challengeBarData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="#1e2438" />
              <Bar dataKey="score" name="Score" radius={[0, 2, 2, 0]}>
                {challengeBarData.map((entry, i) => (
                  <Cell key={i} fill={STAR_COLORS[entry.star] ?? accentColor} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex gap-3 mt-2 flex-wrap">
            {Object.entries(STAR_COLORS).map(([star, color]) => (
              <div key={star} className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                <span className="w-2 h-2 rounded-none inline-block" style={{ background: color }} />
                {star}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge detail cards */}
      <div
        className="p-4"
        style={{
          background: accentDim,
          border: `1px solid ${accentBorder}`,
          clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
            Node Breakdown
          </span>
        </div>
        <div className="space-y-3">
          {challenges.map((c, i) => {
            const pct = c.max_score > 0 ? (c.score / c.max_score) * 100 : 0;
            const col = scoreColor(pct);
            return (
              <div
                key={i}
                className="p-3"
                style={{
                  background: "#0d0f17",
                  border: "1px solid #1e2438",
                  clipPath: "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5"
                      style={{
                        color: STAR_COLORS[c.star] ?? "#6b7280",
                        border: `1px solid ${STAR_COLORS[c.star] ?? "#6b7280"}44`,
                        clipPath: "polygon(0 0,calc(100% - 3px) 0,100% 3px,100% 100%,3px 100%,0 calc(100% - 3px))",
                      }}
                    >
                      {c.star}
                    </span>
                    <span className="text-xs font-bold text-[#e8e0cc]">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: col }}>
                    {c.score.toLocaleString()} <span className="text-[#6b7280] font-normal">/ {c.max_score.toLocaleString()}</span>
                  </span>
                </div>
                {/* score bar */}
                <div className="h-1 bg-[#1e2438] mb-2" style={{ clipPath: "polygon(0 0,calc(100% - 2px) 0,100% 2px,100% 100%,2px 100%,0 calc(100% - 2px))" }}>
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, background: col, boxShadow: `0 0 6px ${col}88` }}
                  />
                </div>
                {/* agents */}
                <div className="flex gap-1.5 flex-wrap">
                  {(c.avatar_list ?? []).map((a) => {
                    const info = getAgentInfo(a.id, { role_square_url: a.role_square_url, rarity: a.rarity });
                    const url = info?.iconUrl ?? a.role_square_url;
                    const elemColor = ELEMENT_COLORS[a.element_type] ?? "#6b7280";
                    return (
                      <div key={a.id} className="relative" title={info?.name ?? `Agent ${a.id}`}>
                        <div
                          className="w-8 h-8 overflow-hidden"
                          style={{
                            border: `1px solid ${elemColor}55`,
                            clipPath: "polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))",
                          }}
                        >
                          <Image src={url ?? "/placeholder.png"} alt="" width={32} height={32} unoptimized />
                        </div>
                      </div>
                    );
                  })}
                  {c.buffer?.name && (
                    <span className="ml-auto text-[10px] text-[#a855f7] self-center">⚡ {c.buffer.name}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent usage grid */}
      {agentUsage.length > 0 && (
        <div
          className="p-4"
          style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 inline-block" style={{ background: accentColor }} />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
              Agent Usage ({valid.length} season{valid.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {agentUsage.map(([id, agent]) => {
              const info = getAgentInfo(Number(id), { role_square_url: agent.url, rarity: agent.rarity as "S" | "A" });
              const url = info?.iconUrl ?? agent.url;
              const elemColor = ELEMENT_COLORS[agent.element] ?? "#6b7280";
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <div
                      className="w-12 h-12 overflow-hidden"
                      style={{
                        border: `1px solid ${elemColor}55`,
                        background: `${elemColor}11`,
                        clipPath: "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))",
                      }}
                    >
                      <Image src={url ?? "/placeholder.png"} alt={info?.name ?? `${id}`} width={48} height={48} unoptimized />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 text-[8px] font-black px-0.5"
                      style={{ background: agent.rarity === "S" ? "#f5c842" : "#00d4ff", color: "#08090d" }}
                    >
                      {agent.rarity}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6b7280] text-center leading-tight">
                    {info?.name?.split(" ")[0] ?? `#${id}`}
                  </span>
                  <span
                    className="text-[9px] font-bold px-1"
                    style={{ color: elemColor, border: `1px solid ${elemColor}44` }}
                  >
                    ×{agent.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

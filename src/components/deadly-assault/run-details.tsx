import type { DeadlyAssaultRun } from "@/types/deadly-assault";

import Image from "next/image";

export function RunDetails({ run }: { run: DeadlyAssaultRun }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2"><b>Total Score:</b> <span role="img" aria-label="score">🏆</span> {run.score}</div>
      <div className="flex items-center gap-2"><b>Stars:</b> <span role="img" aria-label="stars">⭐</span> {run.star} / {run.total_star}</div>
      <div className="flex items-center gap-2">
        <b>Bosses:</b> <span role="img" aria-label="boss">👹</span>
        {run.boss.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-1 mr-2">
            {b.icon && <Image src={b.icon} alt={b.name} width={20} height={20} className="w-5 h-5 inline-block rounded" unoptimized />}
            {b.name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <b>Teams:</b> <span role="img" aria-label="team">👥</span>
        {run.avatar_list.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-1 mr-1">
            {a.role_square_url && <Image src={a.role_square_url} alt={`Avatar #${a.id}`} width={20} height={20} className="w-5 h-5 rounded-full border inline-block" unoptimized />}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <b>Buffs:</b> <span role="img" aria-label="buff">🧃</span>
        </div>
        {run.buffer.map((b, i) => (
          <div key={i} className="flex items-center gap-2 pr-2">
            {b.icon && <Image src={b.icon} alt={b.name} width={20} height={20} className="w-5 h-5 rounded inline-block" unoptimized />}
            <span className="font-semibold">{b.name}</span>
          </div>
        ))}
        {run.buffer.map((b, i) => (
          <div key={i + '-desc'} className="pr-8 text-xs text-muted-foreground">
            <span dangerouslySetInnerHTML={{ __html: b.desc }} />
          </div>
        ))}
      </div>
    </div>
  );
}

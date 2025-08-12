import type { ShiyuDefenseData, FloorDetail, TimeStamp } from "@/types/shiyu-defense";
import { FloorDetailCard } from "@/components/shiyu-defense/floor-detail-card";

// Find fastest and slowest Layer 7 clears for node_1 and node_2 separately
function getFastestSlowestLayer7ByNode(allData: ShiyuDefenseData[]) {
  type Run = { floor: FloorDetail; period: ShiyuDefenseData; battle_time: number };
  const node1Runs: Run[] = [];
  const node2Runs: Run[] = [];
  for (const d of allData) {
    for (const floor of d.data.all_floor_detail) {
      if (floor.layer_index === 7) {
        if (floor.node_1 && typeof floor.node_1.battle_time === 'number') {
          node1Runs.push({ floor, period: d, battle_time: floor.node_1.battle_time });
        }
        if (floor.node_2 && typeof floor.node_2.battle_time === 'number') {
          node2Runs.push({ floor, period: d, battle_time: floor.node_2.battle_time });
        }
      }
    }
  }
  const fastestNode1 = node1Runs.reduce((min, r) => (min === null || r.battle_time < min.battle_time ? r : min), null as Run | null);
  const slowestNode1 = node1Runs.reduce((max, r) => (max === null || r.battle_time > max.battle_time ? r : max), null as Run | null);
  const fastestNode2 = node2Runs.reduce((min, r) => (min === null || r.battle_time < min.battle_time ? r : min), null as Run | null);
  const slowestNode2 = node2Runs.reduce((max, r) => (max === null || r.battle_time > max.battle_time ? r : max), null as Run | null);
  return { fastestNode1, slowestNode1, fastestNode2, slowestNode2 };
}

function formatDate(ts?: TimeStamp) {
  if (!ts) return "Unknown";
  return `${ts.year}-${String(ts.month).padStart(2, '0')}-${String(ts.day).padStart(2, '0')}`;
}

export function BestWorstRuns({ allData }: { allData: ShiyuDefenseData[] }) {
  const { fastestNode1, slowestNode1, fastestNode2, slowestNode2 } = getFastestSlowestLayer7ByNode(allData);
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Node 1 */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Node 1 (First Half) Layer 7</h3>
        <div className="mb-4">
          <b>Fastest Clear</b><br/>
          {fastestNode1 ? <>
            <div className="mb-2 text-sm text-muted-foreground">
              Cleared on: {formatDate(fastestNode1.floor.floor_challenge_time)}<br/>
              Battle Time: <b>{fastestNode1.battle_time}s</b>
            </div>
            <FloorDetailCard floor={fastestNode1.floor} node="node_1" />
          </> : <p>No Layer 7 Node 1 clear data available.</p>}
        </div>
        <div>
          <b>Slowest Clear</b><br/>
          {slowestNode1 ? <>
            <div className="mb-2 text-sm text-muted-foreground">
              Cleared on: {formatDate(slowestNode1.floor.floor_challenge_time)}<br/>
              Battle Time: <b>{slowestNode1.battle_time}s</b>
            </div>
            <FloorDetailCard floor={slowestNode1.floor} node="node_1" />
          </> : <p>No Layer 7 Node 1 clear data available.</p>}
        </div>
      </div>
      {/* Node 2 */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold text-lg mb-2 text-primary drop-shadow-sm">Node 2 (Second Half) Layer 7</h3>
        <div className="mb-4">
          <b>Fastest Clear</b><br/>
          {fastestNode2 ? <>
            <div className="mb-2 text-sm text-muted-foreground">
              Cleared on: {formatDate(fastestNode2.floor.floor_challenge_time)}<br/>
              Battle Time: <b>{fastestNode2.battle_time}s</b>
            </div>
            <FloorDetailCard floor={fastestNode2.floor} node="node_2" />
          </> : <p>No Layer 7 Node 2 clear data available.</p>}
        </div>
        <div>
          <b>Slowest Clear</b><br/>
          {slowestNode2 ? <>
            <div className="mb-2 text-sm text-muted-foreground">
              Cleared on: {formatDate(slowestNode2.floor.floor_challenge_time)}<br/>
              Battle Time: <b>{slowestNode2.battle_time}s</b>
            </div>
            <FloorDetailCard floor={slowestNode2.floor} node="node_2" />
          </> : <p>No Layer 7 Node 2 clear data available.</p>}
        </div>
      </div>
    </div>
  );
}

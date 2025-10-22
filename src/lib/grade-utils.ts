import { mapStarRatingToGrade } from "@/utils/ratingMapper";
import type { AgentInfo, Avatar } from "@/types/shared";

/**
 * Client-safe version of getAgentInfo - uses props instead of filesystem
 * For use in client components only
 */
export function getAgentInfoClient(id: number, avatarInfo?: Partial<Avatar>): AgentInfo {
  // Fallback for when character data file doesn't exist
  let fallbackRarity = 0;
  if (avatarInfo?.rarity !== undefined) {
    if (typeof avatarInfo.rarity === 'string') {
      if (avatarInfo.rarity === 'S') {
        fallbackRarity = 4;
      } else if (avatarInfo.rarity === 'A') {
        fallbackRarity = 3;
      } else {
        fallbackRarity = Number(avatarInfo.rarity) || 0;
      }
    } else {
      fallbackRarity = Number(avatarInfo.rarity);
    }
  }
  
  return {
    id,
    name: `Agent ${id}`,
    weaponType: "-",
    elementType: "-",
    rarity: fallbackRarity,
    iconUrl: avatarInfo?.role_square_url || '/placeholder.png',
    level: avatarInfo?.level,
  };
}

/**
 * Gets the element name from element type number
 */
export function getElementName(elementType?: number): string {
  const ELEMENT_NAMES: Record<number, string> = {
    200: "Physical",
    201: "Fire",
    202: "Ice",
    203: "Electric",
    204: "Growth",
    205: "Ether"
  };
  
  if (elementType === undefined) return "Unknown";
  return ELEMENT_NAMES[elementType] || "Unknown";
}

/**
 * Gets the grade (A/S) for an agent based on rarity (client-safe version)
 */
export function getAgentGrade(agent: AgentInfo | Avatar): string {
  const rarity = 'rarity' in agent ? agent.rarity : 3;
  const numericRarity = typeof rarity === 'number' ? rarity : parseInt(String(rarity)) || 3;
  return mapStarRatingToGrade(numericRarity);
}

/**
 * Groups agents by their grade
 */
export function getAgentsByGrade(agents: (AgentInfo | Avatar)[]): Record<string, (AgentInfo | Avatar)[]> {
  const grouped: Record<string, (AgentInfo | Avatar)[]> = {};
  
  agents.forEach(agent => {
    const grade = getAgentGrade(agent);
    if (!grouped[grade]) {
      grouped[grade] = [];
    }
    grouped[grade].push(agent);
  });
  
  return grouped;
}

/**
 * Filters agents by grade
 */
export function filterAgentsByGrade(agents: (AgentInfo | Avatar)[], grades: string[]): (AgentInfo | Avatar)[] {
  if (grades.length === 0) return agents;
  return agents.filter(agent => grades.includes(getAgentGrade(agent)));
}

/**
 * Formats agent display with grade
 */
export function formatAgentDisplay(agent: AgentInfo | Avatar): string {
  const name = 'name' in agent ? agent.name : `Agent ${agent.id}`;
  const grade = getAgentGrade(agent);
  return `${name} (${grade})`;
}

/**
 * Gets all available grades from a list of agents
 */
export function getAvailableGrades(agents: (AgentInfo | Avatar)[]): string[] {
  const grades = new Set(agents.map(agent => getAgentGrade(agent)));
  return Array.from(grades).sort().reverse(); // S, A order
}

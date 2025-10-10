import { mapStarRatingToGrade } from "@/utils/ratingMapper";
import type { AgentInfo, Avatar } from "@/types/shared";

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

import path from "path";
import fs from "fs";
import { AgentInfo, Avatar, ELEMENT_TYPES, ELEMENT_COLORS, RARITY_COLORS } from "@/types/shared";

/**
 * Fetches agent information based on the given ID.
 * Prioritizes Hoyoverse URLs for images and falls back to local paths or placeholders.
 *
 * @param id - The ID of the agent.
 * @param avatarInfo - The avatar information containing additional details.
 * @returns An object containing agent details or null if not found.
 */
export function getAgentInfo(id: number, avatarInfo?: Partial<Avatar>): AgentInfo | null {
  try {
    const charPath = path.join(process.cwd(), "public/characters", `${id}.json`);
    const data = JSON.parse(fs.readFileSync(charPath, "utf-8"));
    
    // Handle rarity conversion - convert string rarities (S, A) to numbers
    let finalRarity = 0;
    if (avatarInfo?.rarity !== undefined) {
      if (typeof avatarInfo.rarity === 'string') {
        // Convert letter grades to numbers using data rarity as reference
        const dataRarity = Number(data.Rarity) || 1;
        if (avatarInfo.rarity === 'S') {
          finalRarity = dataRarity >= 4 ? dataRarity : 4; // S rank should be 4+ stars
        } else if (avatarInfo.rarity === 'A') {
          finalRarity = dataRarity <= 3 ? dataRarity : 3; // A rank should be 3 or less stars
        } else {
          finalRarity = Number(avatarInfo.rarity) || dataRarity;
        }
      } else {
        finalRarity = Number(avatarInfo.rarity);
      }
    } else {
      finalRarity = Number(data.Rarity) || 0;
    }
    
    const result = {
      id,
      name: String(data.Name || `Agent ${id}`),
      weaponType: Object.values(data.WeaponType || {})[0] ? String(Object.values(data.WeaponType)[0]) : "-",
      elementType: Object.values(data.ElementType || {})[0] ? String(Object.values(data.ElementType)[0]) : "-",
      rarity: finalRarity,
      iconUrl: avatarInfo?.role_square_url || '/placeholder.png',
      level: avatarInfo?.level,
    };
    
    return result;
  } catch {
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
      elementType: getElementName(avatarInfo?.element_type),
      rarity: fallbackRarity,
      iconUrl: avatarInfo?.role_square_url || '/placeholder.png',
      level: avatarInfo?.level,
    };
  }
}

/**
 * Gets the element name from element type number
 */
export function getElementName(elementType?: number): string {
  if (elementType === undefined) return "Unknown";
  return ELEMENT_TYPES[elementType] || "Unknown";
}

/**
 * Gets the element color from element type number
 */
export function getElementColor(elementType?: number): string {
  if (elementType === undefined) return "#666666";
  return ELEMENT_COLORS[elementType] || "#666666";
}

/**
 * Gets the rarity color from rarity string
 */
export function getRarityColor(rarity?: string): string {
  if (!rarity) return "#999999";
  return RARITY_COLORS[rarity.toUpperCase()] || "#999999";
}

/**
 * Creates a team key from an array of avatars for grouping purposes
 */
export function createTeamKey(avatars: Avatar[]): string {
  return avatars
    .map(a => a.id)
    .sort((a, b) => a - b)
    .join('-');
}

/**
 * Formats agent level display
 */
export function formatAgentLevel(level?: number): string {
  return level ? `Lv.${level}` : "Lv.?";
}

/**
 * Gets agent profession name from profession number
 */
export function getProfessionName(profession?: number): string {
  const professions: Record<number, string> = {
    1: "Attack",
    2: "Stun", 
    3: "Anomaly",
    4: "Support",
    5: "Defense"
  };
  
  if (profession === undefined) return "Unknown";
  return professions[profession] || "Unknown";
}

/**
 * Validates if an avatar object has required fields
 */
export function isValidAvatar(avatar: unknown): avatar is Avatar {
  return (
    typeof avatar === 'object' &&
    avatar !== null &&
    typeof (avatar as Avatar).id === 'number' &&
    typeof (avatar as Avatar).level === 'number' &&
    typeof (avatar as Avatar).element_type === 'number'
  );
}

/**
 * Gets abbreviated element name for compact displays
 */
export function getElementAbbreviation(elementType?: number): string {
  const abbreviations: Record<number, string> = {
    200: "PHY",
    201: "FIR", 
    202: "ICE",
    203: "ELE",
    204: "GRS",
    205: "ETH",
    206: "IMG"
  };
  
  if (elementType === undefined) return "???";
  return abbreviations[elementType] || "???";
}

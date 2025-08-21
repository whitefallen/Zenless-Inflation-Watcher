import path from "path";
import fs from "fs";

/**
 * Fetches agent information based on the given ID.
 * Prioritizes Hoyoverse URLs for images and falls back to local paths or placeholders.
 *
 * @param id - The ID of the agent.
 * @param avatarInfo - The avatar information containing the role_square_url.
 * @returns An object containing agent details or null if not found.
 */
export function getAgentInfo(id: number, avatarInfo: { role_square_url?: string; rarity?: number }): { name: string; weaponType: string; elementType: string; rarity: number; iconUrl: string } | null {
  try {
    const charPath = path.join(process.cwd(), "public/characters", `${id}.json`);
    const data = JSON.parse(fs.readFileSync(charPath, "utf-8"));
    return {
      name: String(data.Name),
      weaponType: Object.values(data.WeaponType)[0] ? String(Object.values(data.WeaponType)[0]) : "-",
      elementType: Object.values(data.ElementType)[0] ? String(Object.values(data.ElementType)[0]) : "-",
      rarity: avatarInfo.rarity || Number(data.Rarity) || 0,
      iconUrl: avatarInfo.role_square_url || '/placeholder.png',
    };
  } catch {
    return null;
  }
}

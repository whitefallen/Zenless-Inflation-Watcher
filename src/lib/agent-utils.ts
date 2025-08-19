import path from "path";
import fs from "fs";

/**
 * Fetches agent information based on the given ID.
 * Prioritizes Hoyoverse URLs for images and falls back to local paths or placeholders.
 *
 * @param id - The ID of the agent.
 * @returns An object containing agent details or a fallback object if not found.
 */
export function getAgentInfo(id: number) {
  try {
    const charPath = path.join(process.cwd(), "public/characters", `${id}.json`);
    const data = JSON.parse(fs.readFileSync(charPath, "utf-8"));
    const iconPath = data.PartnerInfo?.IconPath || data.IconPath;
    const iconUrl = iconPath && iconPath.startsWith('http')
      ? iconPath // Use Hoyoverse URL if available
      : iconPath
      ? '/characters/' + String(data.Id) + '.png' // Fallback to local path
      : '/placeholder.png'; // Final fallback
    return {
      name: String(data.Name),
      weaponType: Object.values(data.WeaponType)[0] ? String(Object.values(data.WeaponType)[0]) : "-",
      elementType: Object.values(data.ElementType)[0] ? String(Object.values(data.ElementType)[0]) : "-",
      rarity: Number(data.Rarity) || 0,
      iconUrl,
    };
  } catch {
    return {
      name: "Unknown",
      weaponType: "-",
      elementType: "-",
      rarity: 0,
      iconUrl: '/placeholder.png', // Fallback image
    };
  }
}

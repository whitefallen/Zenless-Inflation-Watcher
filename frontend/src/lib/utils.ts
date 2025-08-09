import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function percentile(
  raw: number,
  locale: string = 'de-DE',
): string {
  const percent = raw / 100;

  // Use Intl.NumberFormat so we respect the locale's decimal separator
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatter.format(percent)}%`;
}

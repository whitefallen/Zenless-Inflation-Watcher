import { mapStarRatingToGrade } from '@/utils/ratingMapper';

interface GradeBadgeProps {
  stars: number;
  className?: string;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// ZZZ-style grade colors
const gradeColors: Record<string, { border: string; bg: string; text: string }> = {
  S: { border: 'rgba(245,200,66,0.4)', bg: 'rgba(245,200,66,0.12)', text: '#f5c842' },
  A: { border: 'rgba(0,212,255,0.4)', bg: 'rgba(0,212,255,0.10)', text: '#00d4ff' },
  B: { border: 'rgba(168,85,247,0.4)', bg: 'rgba(168,85,247,0.10)', text: '#a855f7' },
  C: { border: 'rgba(255,107,53,0.4)', bg: 'rgba(255,107,53,0.10)', text: '#ff6b35' },
};

export function GradeBadge({
  stars,
  className = '',
  showLabel = false,
  size = 'md'
}: GradeBadgeProps) {
  const grade = mapStarRatingToGrade(stars);
  const colors = gradeColors[grade] ?? { border: 'rgba(107,114,128,0.4)', bg: 'rgba(107,114,128,0.1)', text: '#6b7280' };

  const sizeClasses = {
    xs: 'px-1 py-0 text-[10px] min-w-[18px]',
    sm: 'px-1.5 py-0.5 text-[10px] min-w-[20px]',
    md: 'px-2 py-0.5 text-xs min-w-[24px]',
    lg: 'px-2.5 py-1 text-sm min-w-[28px]',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-black tracking-wider border ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: colors.border,
        background: colors.bg,
        color: colors.text,
        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        textShadow: `0 0 8px ${colors.text}88`,
      }}
      title={`${stars} star${stars !== 1 ? 's' : ''} (${grade} rank)`}
    >
      {showLabel && <span className="mr-0.5 text-[9px] opacity-70">Rank</span>}
      {grade}
    </span>
  );
}

import { mapStarRatingToGrade } from '@/utils/ratingMapper';

interface GradeBadgeProps {
  stars: number;
  className?: string;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const gradeColors: Record<string, { border: string; bg: string; text: string }> = {
  S: { border: 'rgba(255,212,0,0.45)', bg: 'rgba(255,212,0,0.12)', text: '#ffd400' },
  A: { border: 'rgba(43,224,255,0.45)', bg: 'rgba(43,224,255,0.10)', text: '#2be0ff' },
  B: { border: 'rgba(255,61,46,0.35)', bg: 'rgba(255,61,46,0.10)', text: '#ff3d2e' },
  C: { border: 'rgba(143,145,156,0.45)', bg: 'rgba(143,145,156,0.10)', text: '#8f919c' },
};

export function GradeBadge({
  stars,
  className = '',
  showLabel = false,
  size = 'md'
}: GradeBadgeProps) {
  const grade = mapStarRatingToGrade(stars);
  const colors = gradeColors[grade] ?? { border: 'rgba(143,145,156,0.4)', bg: 'rgba(143,145,156,0.1)', text: '#8f919c' };

  const sizeClasses = {
    xs: 'px-1 py-0 text-[10px] min-w-[18px]',
    sm: 'px-1.5 py-0.5 text-[10px] min-w-[20px]',
    md: 'px-2 py-0.5 text-xs min-w-[24px]',
    lg: 'px-2.5 py-1 text-sm min-w-[28px]',
  };

  return (
    <span
      className={`inline-flex items-center justify-center border font-black tracking-normal ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: colors.border,
        background: colors.bg,
        color: colors.text,
      }}
      title={`${stars} star${stars !== 1 ? 's' : ''} (${grade} rank)`}
    >
      {showLabel && <span className="mr-0.5 text-[9px] opacity-70">Rank</span>}
      {grade}
    </span>
  );
}

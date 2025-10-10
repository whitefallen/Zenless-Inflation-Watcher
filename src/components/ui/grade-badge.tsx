import { mapStarRatingToGrade, getGradeColorClass } from '@/utils/ratingMapper';

interface GradeBadgeProps {
  stars: number;
  className?: string;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function GradeBadge({ 
  stars, 
  className = '', 
  showLabel = false,
  size = 'md'
}: GradeBadgeProps) {
  const grade = mapStarRatingToGrade(stars);
  const colorClass = getGradeColorClass(grade);
  
  const sizeClasses = {
    xs: 'px-1 py-0.5 text-xs',
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-md font-medium border ${colorClass} ${sizeClasses[size]} ${className}`}
      title={`${stars} star${stars !== 1 ? 's' : ''} (${grade} rank)`}
    >
      {showLabel && <span className="mr-1">Rank</span>}
      {grade}
    </span>
  );
}

import Image from "next/image";
import { mapStarRatingToGrade, getGradeColorClass } from "@/utils/ratingMapper";

interface AgentInfoMicroProps {
  name: string;
  rarity: number;
  iconUrl: string;
  showName?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export function AgentInfoMicro({ 
  name, 
  rarity, 
  iconUrl, 
  showName = false,
  size = 'sm'
}: AgentInfoMicroProps) {
  const sizeClasses = {
    xs: { img: "w-4 h-4", text: "text-xs" },
    sm: { img: "w-6 h-6", text: "text-xs" },
    md: { img: "w-8 h-8", text: "text-sm" }
  };
  
  const { img, text } = sizeClasses[size];
  const grade = mapStarRatingToGrade(rarity);
  const gradeColorClass = getGradeColorClass(grade);
  
  return (
    <div className="flex items-center gap-1 relative group">
      <div className="relative">
        <Image
          src={iconUrl}
          alt={name}
          width={size === 'xs' ? 16 : size === 'sm' ? 24 : 32}
          height={size === 'xs' ? 16 : size === 'sm' ? 24 : 32}
          className={`${img} rounded border flex-shrink-0`}
          unoptimized
        />
        {/* Grade indicator as overlay */}
        <div className={`absolute -top-1 -right-1 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-sm border ${gradeColorClass}`}>
          {grade}
        </div>
      </div>
      
      {showName && (
        <span className={`${text} font-medium truncate min-w-0 max-w-20`}>
          {name}
        </span>
      )}
      
      {/* Tooltip for hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 backdrop-blur-sm border border-gray-600">
        <div className="font-medium">{name}</div>
        <div className="text-yellow-400">{grade}-Rank ({rarity} stars)</div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
  );
}

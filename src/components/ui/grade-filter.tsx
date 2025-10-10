"use client";

import { useState } from 'react';
import { Button } from './button';
import { getGradeColorClass } from '@/utils/ratingMapper';

interface GradeFilterProps {
  onFilterChange: (grades: string[]) => void;
  availableGrades?: string[];
  className?: string;
  initialGrades?: string[];
}

export function GradeFilter({ 
  onFilterChange, 
  availableGrades = ['A', 'S'],
  className = '',
  initialGrades = []
}: GradeFilterProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(initialGrades);

  const handleGradeToggle = (grade: string) => {
    const newSelected = selectedGrades.includes(grade)
      ? selectedGrades.filter(g => g !== grade)
      : [...selectedGrades, grade];
    
    setSelectedGrades(newSelected);
    onFilterChange(newSelected);
  };

  const clearFilters = () => {
    setSelectedGrades([]);
    onFilterChange([]);
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Filter by Rank:
      </span>
      
      {availableGrades.map(grade => {
        const isSelected = selectedGrades.includes(grade);
        const colorClass = getGradeColorClass(grade);
        
        return (
          <button
            key={grade}
            onClick={() => handleGradeToggle(grade)}
            className={`px-2 py-1 rounded text-sm font-medium border transition-all hover:scale-105 ${
              isSelected 
                ? colorClass
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Rank {grade}
          </button>
        );
      })}
      
      {selectedGrades.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="text-xs px-2 py-1 h-auto"
        >
          Clear
        </Button>
      )}
    </div>
  );
}

/**
 * Maps star ratings to letter grades for agents
 * 3 stars = A rank
 * 4 stars = S rank
 */
export function mapStarRatingToGrade(stars: number): string {
  switch (stars) {
    case 3:
      return 'A';
    case 4:
      return 'S';
    default:
      return stars.toString(); // fallback to number for unexpected values
  }
}

/**
 * Maps letter grades back to star ratings if needed
 */
export function mapGradeToStarRating(grade: string): number {
  switch (grade.toUpperCase()) {
    case 'A':
      return 3;
    case 'S':
      return 4;
    default:
      return parseInt(grade) || 0;
  }
}

/**
 * Gets the appropriate CSS class for the grade
 */
export function getGradeColorClass(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
      return 'text-purple-400 bg-gray-800 dark:bg-gray-900 border-gray-600 dark:border-gray-700';
    case 'S':
      return 'text-amber-400 bg-gray-800 dark:bg-gray-900 border-gray-600 dark:border-gray-700';
    default:
      return 'text-gray-400 bg-gray-800 dark:bg-gray-900 border-gray-600 dark:border-gray-700';
  }
}

/**
 * Gets gradient background for grade
 */
export function getGradeGradientClass(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
      return 'bg-gradient-to-r from-purple-500 to-purple-600';
    case 'S':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
}

/**
 * Gets the appropriate text color for contrast
 */
export function getGradeTextClass(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
      return 'text-purple-700 dark:text-purple-300';
    case 'S':
      return 'text-yellow-700 dark:text-yellow-300';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
}

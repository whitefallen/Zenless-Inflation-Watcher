/**
 * SafeTextDisplay - A component that safely displays text with line breaks
 * without using dangerouslySetInnerHTML
 */

interface SafeTextDisplayProps {
  text: string;
  className?: string;
}

/**
 * Safely displays text with proper line breaks
 * Replaces dangerouslySetInnerHTML usage
 */
export function SafeTextDisplay({ text, className }: SafeTextDisplayProps) {
  // Split by escaped newlines and actual newlines
  const lines = text.split(/\\n|\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) return null;
  
  if (lines.length === 1) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span className={className} style={{ whiteSpace: 'pre-line' }}>
      {lines.join('\n')}
    </span>
  );
}

/**
 * Displays formatted buff text safely
 * Handles color tags by removing them
 */
export function SafeBuffText({ text, className }: SafeTextDisplayProps) {
  // Remove color tags
  const cleanText = text.replace(/<color=[^>]+>([^<]*)<\/color>/g, '$1');
  
  return <SafeTextDisplay text={cleanText} className={className} />;
}

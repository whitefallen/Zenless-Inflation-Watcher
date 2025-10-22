/**
 * EmptyState component for displaying helpful messages when no data is available
 */

import { FileQuestion, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * Displays a user-friendly empty state with optional action button
 */
export function EmptyState({ 
  icon: Icon = FileQuestion, 
  title, 
  description, 
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-muted-foreground mb-4">
        <Icon className="h-16 w-16" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        {description}
      </p>
      {action && (
        action.href ? (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </button>
        )
      )}
    </div>
  );
}

/**
 * Empty state specifically for no battle records
 */
export function NoBattleRecordsEmpty() {
  return (
    <EmptyState
      title="No Battle Records Found"
      description="Start by collecting your battle data using the automated fetch system. Your battle history will appear here once data is available."
      action={{
        label: "Learn How to Collect Data",
        href: "https://github.com/whitefallen/Zenless-Inflation-Watcher#readme"
      }}
    />
  );
}

/**
 * Empty state for no teams data
 */
export function NoTeamsEmpty() {
  return (
    <EmptyState
      title="No Team Data Available"
      description="Team composition data will be displayed here once you complete some battles."
    />
  );
}

/**
 * Empty state for no character data
 */
export function NoCharactersEmpty() {
  return (
    <EmptyState
      title="No Character Data"
      description="Character performance statistics will appear here after you've used them in battles."
    />
  );
}

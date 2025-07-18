
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: 'queued' | 'running' | 'completed' | 'error';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'running':
        return {
          label: 'Running',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'error':
        return {
          label: 'Error',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'queued':
        return {
          label: 'Queued',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className
    )}>
      {status === 'running' && (
        <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1"></div>
      )}
      {config.label}
    </span>
  );
};

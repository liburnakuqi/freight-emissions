'use client';

export type StatusBadgeType = 'pending' | 'processing' | 'success' | 'error' | 'invalid';

type StatusBadgeProps = {
  status: StatusBadgeType;
  error?: string;
};

export default function StatusBadge({ status, error }: StatusBadgeProps) {
  const StatusDot = ({ color }: { color: string }) => (
    <span className={`inline-block w-2 h-2 rounded-full ${color} mr-2`}></span>
  );

  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center text-sm text-gray-600">
          <StatusDot color="bg-gray-400" />
          Pending
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center text-sm text-blue-600">
          <StatusDot color="bg-blue-500" />
          Processing
        </span>
      );
    case 'success':
      return (
        <span className="inline-flex items-center text-sm text-green-600">
          <StatusDot color="bg-green-500" />
          Completed
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center text-sm text-red-600" title={error}>
          <StatusDot color="bg-red-500" />
          Error
        </span>
      );
    case 'invalid':
      return (
        <span className="inline-flex items-center text-sm text-red-600" title={error}>
          <StatusDot color="bg-red-500" />
          Invalid
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center text-sm text-gray-600">
          <StatusDot color="bg-gray-400" />
          Pending
        </span>
      );
  }
}

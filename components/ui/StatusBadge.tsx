import { LeadStatus, ApplicationStatus } from '@/types';

type Status = LeadStatus | ApplicationStatus;

const statusStyles: Record<string, string> = {
  NEW:        'bg-blue-100 text-blue-700',
  CONTACTED:  'bg-yellow-100 text-yellow-700',
  QUALIFIED:  'bg-purple-100 text-purple-700',
  ENROLLED:   'bg-green-100 text-green-700',
  LOST:       'bg-red-100 text-red-700',
  PENDING:    'bg-yellow-100 text-yellow-700',
  APPROVED:   'bg-green-100 text-green-700',
  REJECTED:   'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
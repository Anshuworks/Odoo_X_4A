import React from 'react';

const dots = {
  Pending: 'bg-amber-400',
  Approved: 'bg-emerald-400',
  Rejected: 'bg-red-400',
};

const StatusBadge = ({ status }) => {
  const cls =
    status === 'Approved'
      ? 'badge-approved'
      : status === 'Rejected'
      ? 'badge-rejected'
      : 'badge-pending';

  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dots[status] || 'bg-slate-400'}`} />
      {status}
    </span>
  );
};

export default StatusBadge;

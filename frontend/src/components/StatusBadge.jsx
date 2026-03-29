import React from 'react';

const dict = {
  pending: { bg: 'bg-amber-400', cls: 'badge-pending' },
  approved: { bg: 'bg-emerald-400', cls: 'badge-approved' },
  rejected: { bg: 'bg-red-400', cls: 'badge-rejected' },
  admin_review: { bg: 'bg-blue-400', cls: 'badge-pending' },
  manager_review: { bg: 'bg-violet-400', cls: 'badge-pending' },
  completed: { bg: 'bg-emerald-400', cls: 'badge-approved' },
  submitted: { bg: 'bg-slate-400', cls: 'badge-pending' },
};

const labelMap = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  admin_review: 'Admin Review',
  manager_review: 'Manager Review',
  completed: 'Completed',
  submitted: 'Submitted',
};

const StatusBadge = ({ status }) => {
  const normStatus = status?.toLowerCase() || 'pending';
  const conf = dict[normStatus] || dict.pending;
  const displayStatus = labelMap[normStatus] || normStatus.charAt(0).toUpperCase() + normStatus.slice(1);

  return (
    <span className={conf.cls}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${conf.bg}`} />
      {displayStatus}
    </span>
  );
};

export default StatusBadge;

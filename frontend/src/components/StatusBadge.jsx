import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      class: 'badge-pending',
      icon: Clock,
      label: 'Pending'
    },
    manager_review: {
      class: 'badge-pending',
      icon: Clock,
      label: 'Manager Review'
    },
    admin_review: {
      class: 'badge-pending',
      icon: Clock,
      label: 'Admin Review'
    },
    approved: {
      class: 'badge-approved',
      icon: CheckCircle,
      label: 'Approved'
    },
    completed: {
      class: 'badge-approved',
      icon: CheckCircle,
      label: 'Completed'
    },
    rejected: {
      class: 'badge-rejected',
      icon: XCircle,
      label: 'Rejected'
    },
    default: {
      class: 'badge-pending',
      icon: AlertCircle,
      label: status
    }
  };

  const { class: className, icon: Icon, label } = config[status] || config.default;

  return (
    <span className={className}>
      <Icon size={12} strokeWidth={3} />
      {label}
    </span>
  );
};

export default StatusBadge;

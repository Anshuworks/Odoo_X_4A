import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className={`relative w-full ${sizeClass} bg-white rounded-2xl shadow-modal border border-slate-100 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

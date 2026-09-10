import React from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" role="presentation">
      <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white border border-stone-200 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 id="admin-modal-title" className="text-lg font-semibold text-stone-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="p-2 rounded-lg text-stone-500 hover:bg-stone-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

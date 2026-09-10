import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LoadErrorProps {
  message?: string;
  onRetry: () => void;
}

export const LoadError: React.FC<LoadErrorProps> = ({
  message = 'We could not load this content. Check your connection and try again.',
  onRetry,
}) => (
  <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
    <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
    <p className="font-semibold text-red-900">Something went wrong</p>
    <p className="mx-auto mt-1 max-w-lg text-sm text-red-700">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
    >
      <RefreshCw className="h-4 w-4" />
      Try again
    </button>
  </div>
);

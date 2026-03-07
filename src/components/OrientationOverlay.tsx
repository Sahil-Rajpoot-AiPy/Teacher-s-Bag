import React from 'react';
import { RotateCcw } from 'lucide-react';

export const OrientationOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-stone-900 text-white p-8 text-center landscape:hidden">
      <div className="bg-emerald-500/20 p-6 rounded-full mb-6 animate-pulse">
        <RotateCcw className="w-16 h-16 text-emerald-400" />
      </div>
      <h2 className="text-3xl font-bold mb-4 tracking-tight">Landscape Mode Required</h2>
      <p className="text-stone-400 max-w-md text-lg leading-relaxed">
        Please rotate your device to landscape mode for the best training experience.
      </p>
    </div>
  );
};

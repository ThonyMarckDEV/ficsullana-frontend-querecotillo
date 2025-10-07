// src/shared/components/CollapsibleSection.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-yellow-500 rounded-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-red-100 hover:bg-red-200 transition-colors"
      >
        <h2 className="text-xl font-bold text-red-800">{title}</h2>
        {isOpen ? <ChevronUp className="w-6 h-6 text-red-800" /> : <ChevronDown className="w-6 h-6 text-red-800" />}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
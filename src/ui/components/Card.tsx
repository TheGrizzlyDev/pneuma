import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-xl bg-white dark:bg-[#1a3222] p-4 shadow-sm border border-gray-100 dark:border-none ${className ?? ''}`}>{children}</div>
);

import React from 'react';

interface Segment<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  active: T;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({ segments, active, onChange }: SegmentedControlProps<T>) => (
  <div className="segmented">
    {segments.map((segment) => (
      <button
        key={segment.id}
        className={`segmented-btn ${active === segment.id ? 'active' : ''}`}
        onClick={() => onChange(segment.id)}
        type="button"
      >
        {segment.label}
      </button>
    ))}
  </div>
);

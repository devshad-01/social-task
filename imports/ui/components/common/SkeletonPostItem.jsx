import React from 'react';

export const SkeletonPostItem = () => (
  <div className="animate-pulse rounded-md bg-white p-4 shadow-sm border border-gray-200 space-y-4">
    <div className="h-4 w-1/2 bg-gray-300 rounded" />
    <div className="h-32 bg-gray-200 rounded" />
    <div className="flex justify-between">
      <div className="h-4 w-24 bg-gray-300 rounded" />
      <div className="h-4 w-12 bg-gray-300 rounded" />
    </div>
  </div>
);

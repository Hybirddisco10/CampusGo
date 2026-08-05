// src/components/LoadingSpinner.jsx
import React from "react";

/**
 * A simple loading spinner with Tailwind CSS.
 * @param {string} size - Tailwind width/height classes (default: 'w-12 h-12')
 * @param {string} color - Border color class (default: 'border-[#eab308]')
 */
const LoadingSpinner = ({ size = "w-12 h-12", color = "border-[#eab308]" }) => {
  return (
    <div
      className={`${size} border-4 ${color} border-t-transparent rounded-full animate-spin`}
    />
  );
};

export default LoadingSpinner;

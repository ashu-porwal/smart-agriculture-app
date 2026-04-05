import React from 'react';

function PlantAvatar({ isResponding = false }) {
  return (
    <div className="plant-avatar" data-responding={isResponding}>
      <svg viewBox="0 0 100 120" width="60" height="80" xmlns="http://www.w3.org/2000/svg">
        {/* Pot */}
        <path
          d="M 35 80 L 30 100 Q 30 110 40 110 L 60 110 Q 70 110 70 100 L 65 80"
          fill="#A0826D"
          stroke="#8B7355"
          strokeWidth="1"
        />
        <path d="M 33 80 L 67 80" fill="none" stroke="#8B7355" strokeWidth="1" />

        {/* Soil */}
        <ellipse cx="50" cy="82" rx="16" ry="3" fill="#8B6F47" opacity="0.6" />

        {/* Stem */}
        <path d="M 50 80 Q 48 60 50 40" fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" />

        {/* Left Leaf (animated) */}
        <g className="leaf leaf-left">
          <path
            d="M 50 55 Q 35 50 30 60"
            fill="none"
            stroke="#27ae60"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M 30 60 L 28 68" fill="none" stroke="#229954" strokeWidth="1.5" opacity="0.7" />
        </g>

        {/* Right Leaf (animated) */}
        <g className="leaf leaf-right">
          <path
            d="M 50 55 Q 65 50 70 60"
            fill="none"
            stroke="#27ae60"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M 70 60 L 72 68" fill="none" stroke="#229954" strokeWidth="1.5" opacity="0.7" />
        </g>

        {/* Top Leaf */}
        <g className="leaf leaf-top">
          <path d="M 50 40 L 50 25" fill="none" stroke="#1e8449" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 50 25 L 48 20 M 50 25 L 52 20" fill="none" stroke="#145a32" strokeWidth="1.5" />
        </g>

        {/* Eyes */}
        <g className="eyes">
          <circle cx="45" cy="48" r="2.5" fill="#333" />
          <circle cx="55" cy="48" r="2.5" fill="#333" />
          <circle cx="45.6" cy="47.8" r="1" fill="white" />
          <circle cx="55.6" cy="47.8" r="1" fill="white" />
        </g>

        {/* Blink animation */}
        <g className="blink" opacity="0">
          <ellipse cx="45" cy="48" rx="2.5" ry="0.5" fill="#333" />
          <ellipse cx="55" cy="48" rx="2.5" ry="0.5" fill="#333" />
        </g>

        {/* Smile */}
        <path
          d="M 44 52 Q 50 54 56 52"
          fill="none"
          stroke="#333"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default PlantAvatar;

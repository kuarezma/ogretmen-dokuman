import React from 'react';
import './DynamicBackground.css';

const DynamicBackground = () => {
  return (
    <div className="dynamic-bg-container">
      <div className="bg-grid"></div>
      
      {/* Floating educational icons or shapes (subtle dots for a minimal feel) */}
      <div className="floating-elements">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
        <div className="dot dot-4"></div>
        <div className="dot dot-5"></div>
      </div>
    </div>
  );
};

export default DynamicBackground;

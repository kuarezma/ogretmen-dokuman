import React from 'react';
import './DynamicBackground.css';

const DynamicBackground = () => {
  return (
    <div className="dynamic-bg-container">
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>
      <div className="bg-grid"></div>
      
    </div>
  );
};

export default DynamicBackground;

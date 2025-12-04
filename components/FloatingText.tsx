import React from 'react';

interface FloatingTextProps {
  x: number;
  y: number;
  text: string;
}

export const FloatingTextComp: React.FC<FloatingTextProps> = ({ x, y, text }) => {
  return (
    <div 
      className="fixed pointer-events-none text-amber-800 font-bold text-2xl font-calligraphy animate-float z-[100] select-none"
      style={{ left: x, top: y }}
    >
      {text}
    </div>
  );
};
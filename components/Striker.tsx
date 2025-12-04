import React, { useRef, useEffect } from 'react';
import { STRIKER_IMG_URL } from '../constants';

interface StrikerProps {
  strikeTrigger: number;
  isResting: boolean;
}

export const Striker: React.FC<StrikerProps> = ({ strikeTrigger, isResting }) => {
  const innerRef = useRef<HTMLDivElement>(null);

  // Handle the "Strike" animation using Web Animations API for high performance
  // independent of React renders.
  useEffect(() => {
    if (strikeTrigger > 0 && innerRef.current) {
      innerRef.current.animate([
        { transform: 'rotate(0deg) translate(0, 0)' },
        { transform: 'rotate(-20deg) translate(-0%, 0%)', offset: 0.1 }, // Snap down
        { transform: 'rotate(0deg) translate(0, 0)' } // Bounce back
      ], {
        duration: 150,
        easing: 'cubic-bezier(0.2, 0, 0.4, 1)',
        fill: 'none'
      });
    }
  }, [strikeTrigger]);

  // Handle "Resting" state via CSS transitions on the wrapper
  const getWrapperTransform = () => {
    if (isResting) {
      // Resting on the table: moved to bottom right, rotated to lie flat
      return 'translate(40%, 40%) rotate(45deg)'; 
    }
    // Ready Position (Hovering): held slightly up
    return 'translate(0, 0) rotate(0deg)'; 
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 will-change-transform"
      style={{
        width: '100%',
        height: '100%',
        transformOrigin: '80% 80%', // Pivot near the hand grip
        transform: getWrapperTransform(),
        transition: isResting 
          ? 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)' // Slow put-down
          : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Fast pick-up
      }}
    >
      {/* Inner container handles the rapid strike rotation */}
      <div 
        ref={innerRef}
        className="w-full h-full will-change-transform flex items-center justify-center"
        style={{ transformOrigin: '80% 80%' }} 
      >
        <img 
          src={STRIKER_IMG_URL} 
          alt="Jianzhi Striker" 
          className="w-[85%] h-[85%] object-contain drop-shadow-2xl"
          style={{
            // The image is likely vertical or diagonal. 
            // We rotate it -45deg to align the head to the top-left (hitting zone) 
            // and handle to bottom-right (pivot zone)
            transform: 'rotate(-45deg)',
            filter: 'drop-shadow(8px 8px 12px rgba(0,0,0,0.4))'
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};
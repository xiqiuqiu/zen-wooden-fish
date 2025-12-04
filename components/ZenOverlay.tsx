import React from 'react';
import { ZenMomentContent } from '../types';

interface ZenOverlayProps {
  content: ZenMomentContent | null;
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const ZenOverlay: React.FC<ZenOverlayProps> = ({ content, isVisible, onClose, isLoading }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-opacity duration-1000 animate-fade-in p-6"
      onClick={onClose} // Click anywhere to close
    >
      <div 
        className="max-w-2xl w-full text-center space-y-8 md:space-y-12 cursor-default"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking text content
      >
        
        {isLoading ? (
          <div className="flex flex-col items-center space-y-4 animate-pulse">
             <div className="text-stone-400 text-xl font-serif tracking-widest">缘起性空...</div>
             <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce"></div>
          </div>
        ) : content ? (
            <>
                {/* Header Title */}
                <div className="text-stone-500 text-xs md:text-sm tracking-[0.5em] font-serif border-b border-stone-800 pb-2 inline-block uppercase opacity-70">
                    Zen Moment
                </div>

                {/* Main Quote */}
                <div className="relative py-4">
                    <span className="absolute -top-4 -left-4 text-6xl text-stone-800 font-serif opacity-50">“</span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-calligraphy text-[#F7F5F2] leading-tight drop-shadow-lg">
                        {content.quote}
                    </h2>
                    <span className="absolute -bottom-8 -right-4 text-6xl text-stone-800 font-serif opacity-50">”</span>
                </div>

                {/* Source Info */}
                <div className="text-stone-400 font-serif text-sm md:text-base italic leading-loose border-l-2 border-stone-800 pl-4 text-left mx-auto max-w-md">
                    {content.source.split('\n').map((line, i) => (
                        <p key={i}>{line.replace(/[*]/g, '')}</p>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-12 h-[1px] bg-stone-700 mx-auto"></div>

                {/* Insight / Mind Dharma */}
                <div className="bg-stone-900/50 p-6 md:p-8 rounded-lg border border-stone-800/50 text-left shadow-2xl">
                    <h3 className="text-amber-700/80 text-sm font-bold tracking-widest mb-3 uppercase">Master's Insight</h3>
                    <div className="text-stone-300 font-serif text-base md:text-lg leading-relaxed space-y-2">
                        {content.insight.split('\n').map((line, i) => (
                             <p key={i}>{line.replace(/[*]/g, '')}</p>
                        ))}
                    </div>
                </div>

                {/* Close Hint */}
                <div className="pt-8">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border border-stone-700 rounded-full text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-all text-xs tracking-widest uppercase hover:bg-white/5"
                    >
                        Return to World
                    </button>
                </div>
            </>
        ) : (
            <div className="text-stone-500">
                Connection lost in the void. (Error loading content)
            </div>
        )}
      </div>
    </div>
  );
};
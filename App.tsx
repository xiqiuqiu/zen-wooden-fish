import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WOODEN_FISH_IMG_URL, CONVERSION_RATES, TRANSLATIONS } from './constants';
import { FloatingText, Inventory, Language } from './types';
import { audioService } from './services/audioService';
import { getZenWisdom } from './services/geminiService';
import { Striker } from './components/Striker';
import { FloatingTextComp } from './components/FloatingText';
import { InventoryDisplay } from './components/InventoryDisplay';

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [strikeTrigger, setStrikeTrigger] = useState(0); // Counter to trigger animations
  const [isResting, setIsResting] = useState(true); // Default to resting state
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [zenQuote, setZenQuote] = useState<string>("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  
  const fishRef = useRef<HTMLDivElement>(null);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[language];

  // Calculate Inventory Logic
  const calculateInventory = (total: number): Inventory => {
    let remainder = total;
    
    // Lotus
    const lotusCost = CONVERSION_RATES.INCENSE_TO_LOTUS * CONVERSION_RATES.BEAD_TO_INCENSE * CONVERSION_RATES.MERIT_TO_BEAD;
    const lotus = Math.floor(remainder / lotusCost);
    remainder %= lotusCost;

    // Incense
    const incenseCost = CONVERSION_RATES.BEAD_TO_INCENSE * CONVERSION_RATES.MERIT_TO_BEAD;
    const incense = Math.floor(remainder / incenseCost);
    remainder %= incenseCost;

    // Beads
    const beadCost = CONVERSION_RATES.MERIT_TO_BEAD;
    const beads = Math.floor(remainder / beadCost);
    remainder %= beadCost;

    return {
      lotus,
      incense,
      beads,
      merits: remainder
    };
  };

  const inventory = calculateInventory(totalClicks);

  // Activity Monitor: If user doesn't interact for 3 seconds, put the striker down (Resting)
  const resetActivityTimer = useCallback(() => {
    // If we were resting, this "wakes up" the striker (Picking it up)
    setIsResting(false);

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    activityTimerRef.current = setTimeout(() => {
      setIsResting(true); // Put striker back to rest
    }, 3000);
  }, []);

  // Floating text cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingTexts(prev => prev.filter(ft => Date.now() - ft.id < 1200));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleInteractionStart = () => {
    resetActivityTimer();
  };

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    // Clear quote when switching language as it might be in the wrong language
    setZenQuote(""); 
  };

  // UPDATED: Uses PointerEvent to handle both Mouse and Touch consistently
  // This prevents double firing (touchstart + mousedown) on mobile.
  const handleKnock = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent default browser actions (like text selection or scrolling on some browsers)
    e.preventDefault(); 
    
    // Stop propagation to prevent any parent handlers
    e.stopPropagation();

    // Ensure striker is active/awake
    resetActivityTimer();

    // 1. Audio
    audioService.playKnock();

    // 2. Visuals - Trigger Striker Animation via counter
    setStrikeTrigger(prev => prev + 1);

    // Calculate click position for subtle tilt feedback (Physics)
    // PointerEvent provides clientX/Y directly for both mouse and touch
    const clientX = e.clientX;
    const clientY = e.clientY;

    let rotateX = 0;
    let rotateY = 0;

    if (fishRef.current) {
        const rect = fishRef.current.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        
        rotateX = (y / (rect.height / 2)) * -2;
        rotateY = (x / (rect.width / 2)) * 2;
        
        // Use Web Animations API for high-performance physics recoil without React re-renders
        fishRef.current.animate([
            { transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)` },
            { transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(0.96)`, offset: 0.1 },
            { transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)` }
        ], {
            duration: 150,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
    }

    // 3. Floating Text
    const randomOffsetX = (Math.random() - 0.5) * 60;
    const randomOffsetY = (Math.random() - 0.5) * 60;

    // Use current language for the floating text
    const text = language === 'zh' ? TRANSLATIONS.zh.floating_merit : TRANSLATIONS.en.floating_merit;

    const newText: FloatingText = {
      id: Date.now(),
      x: clientX + randomOffsetX,
      y: clientY - 80 + randomOffsetY, 
      text: text
    };
    setFloatingTexts(prev => [...prev, newText]);

    // 4. Update State
    setTotalClicks(prev => prev + 1);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10); 
    }
  }, [resetActivityTimer, language]); 

  const handleSeekWisdom = async () => {
    if (isLoadingQuote) return;
    setIsLoadingQuote(true);
    setZenQuote(language === 'zh' ? "参悟中..." : "Meditating...");
    const quote = await getZenWisdom(totalClicks, language);
    setZenQuote(quote);
    setIsLoadingQuote(false);
  };

  return (
    // UPDATED: h-[100dvh] ensures it fits mobile screen exactly without address bar scroll issues.
    // justifyContent changed to flex-col with gap to make it tighter.
    <div 
      className="h-[100dvh] bg-[#F7F5F2] flex flex-col items-center overflow-hidden touch-none select-none"
      onPointerMove={handleInteractionStart}
      onPointerDown={handleInteractionStart}
    >
      
      {/* Language Toggle Button */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-stone-200/50 backdrop-blur-sm hover:bg-stone-300/50 text-stone-600 rounded-full font-serif text-xs md:text-sm transition-all border border-stone-300/50"
      >
        {language === 'zh' ? 'EN' : '中'}
      </button>

      {/* Header / Inventory Area */}
      {/* Reduced padding on desktop (md:pt-10 -> md:pt-6) to save vertical space */}
      <header className="w-full pt-4 md:pt-6 flex flex-col items-center z-10 pointer-events-none flex-none">
        <h1 className="text-3xl md:text-5xl font-calligraphy text-stone-800 mb-2 md:mb-4 opacity-90">{t.title}</h1>
        <div className="pointer-events-auto">
            <InventoryDisplay inventory={inventory} totalClicks={totalClicks} language={language} />
        </div>
      </header>

      {/* Main Interactive Area */}
      {/* flex-grow ensures this takes up available space, centering the fish vertically in that space */}
      <main className="flex-grow w-full flex items-center justify-center relative perspective-container mx-h-50">
        
        {/* The Striker (Visual only) */}
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
             <div 
                className="relative transition-transform duration-300"
                style={{
                  // Added vh constraint for better fit on landscape desktop screens
                  width: 'min(50vw, 280px, 35vh)',
                  height: 'min(50vw, 280px, 35vh)',
                }}
             >
                {/* 
                  Positioning Logic:
                  Mobile: translate-x-[14%] translate-y-[2%] 
                         - Moves container Right and slightly Down from center.
                         - Reduced Y (from 16%) to align stick vertically with fish (unified horizontal line).
                  Desktop: md:translate-x-[25%] md:-translate-y-[20%]
                         - Moves container further Out and Up, suiting the larger layout/fish ratio on PC.
                */}
                <div className="w-full h-full transform translate-x-[14%] translate-y-[2%] md:translate-x-[25%] md:-translate-y-[20%]">
                  <Striker strikeTrigger={strikeTrigger} isResting={isResting} />
                </div>
             </div>
        </div>

        {/* The Wooden Fish Container */}
        <div 
            className="relative flex items-center justify-center group"
            style={{
                width: 'var(--fish-size)',
                height: 'var(--fish-size)',
                // Added 50vh constraint to prevent fish from pushing footer off screen on laptops
                '--fish-size': 'min(65vw, 450px, 50vh)', 
            } as React.CSSProperties}
        >
            {/* The Clickable Fish */}
            {/* UPDATED: Uses onPointerDown exclusively. touch-action: manipulation removes tap delay. */}
            <div 
              ref={fishRef}
              onPointerDown={handleKnock}
              className="w-full h-full relative cursor-pointer z-20 will-change-transform"
              style={{ 
                  transform: 'perspective(1000px) scale(1)',
                  touchAction: 'manipulation' // Prevents double-tap zoom, speeds up tap response
              }}
            >
              <img 
                src={WOODEN_FISH_IMG_URL} 
                alt="Muyu" 
                className="w-full h-full object-contain drop-shadow-2xl select-none"
                draggable="false"
                style={{
                    filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.12))',
                    WebkitTapHighlightColor: 'transparent'
                }}
              />
            </div>
            
            {/* Floor Shadow (Dynamic) */}
            <div 
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-black/10 blur-2xl rounded-[100%] pointer-events-none transition-all duration-100"
                style={{
                    transform: strikeTrigger % 2 !== 0 ? 'translate(-50%, 0) scale(0.95)' : 'translate(-50%, 0) scale(1)', 
                    opacity: 0.2
                }}
            />
        </div>

        {/* Floating Texts Layer */}
        {floatingTexts.map(ft => (
          <FloatingTextComp key={ft.id} {...ft} />
        ))}
      </main>

      {/* Footer / Zen Features */}
      {/* Compact padding for mobile, reduced bottom padding slightly for desktop */}
      <footer className="w-full pb-4 md:pb-6 px-6 flex flex-col items-center z-10 space-y-3 md:space-y-5 flex-none">
        
        {/* Zen Quote Display */}
        {/* Fixed height to prevent layout jumps, but smaller min-height for mobile */}
        <div className="min-h-[60px] md:min-h-[80px] max-w-lg w-full text-center relative">
            {zenQuote && (
                <div className="relative bg-white/60 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-stone-200/50 shadow-lg animate-fade-in transition-all group">
                    {/* Close Button */}
                    <button 
                        onClick={() => setZenQuote("")}
                        className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200/30 rounded-full transition-colors z-20"
                        title={language === 'zh' ? "关闭" : "Close"}
                        aria-label="Close quote"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    {/* Text content with right padding to avoid close button */}
                    <p className="text-stone-800 font-calligraphy text-xl md:text-2xl leading-relaxed pr-6">
                        {zenQuote}
                    </p>
                </div>
            )}
        </div>

        <button 
          onClick={handleSeekWisdom}
          disabled={isLoadingQuote}
          className="px-8 py-3 bg-[#2C2C2C] text-[#F7F5F2] rounded-full font-serif text-sm md:text-base tracking-widest hover:bg-black active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingQuote ? t.meditating : t.seek_wisdom}
        </button>

        <div className="text-stone-400 text-xs font-serif tracking-wide opacity-60">
          {t.footer_hint}
        </div>
      </footer>
    </div>
  );
}
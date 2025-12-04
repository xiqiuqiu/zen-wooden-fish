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

  const handleKnock = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Prevent duplicate events
    
    // Ensure striker is active/awake
    resetActivityTimer();

    // 1. Audio
    audioService.playKnock();

    // 2. Visuals - Trigger Striker Animation via counter
    setStrikeTrigger(prev => prev + 1);

    // Calculate click position for subtle tilt feedback (Physics)
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

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
  }, [resetActivityTimer, language]); // Added language as dependency

  const handleSeekWisdom = async () => {
    if (isLoadingQuote) return;
    setIsLoadingQuote(true);
    setZenQuote(language === 'zh' ? "参悟中..." : "Meditating...");
    const quote = await getZenWisdom(totalClicks, language);
    setZenQuote(quote);
    setIsLoadingQuote(false);
  };

  return (
    <div 
      className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-between overflow-hidden touch-none select-none"
      onMouseMove={handleInteractionStart}
      onTouchStart={handleInteractionStart}
    >
      
      {/* Language Toggle Button */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-stone-200/50 backdrop-blur-sm hover:bg-stone-300/50 text-stone-600 rounded-full font-serif text-xs md:text-sm transition-all border border-stone-300/50"
      >
        {language === 'zh' ? 'EN' : '中'}
      </button>

      {/* Header / Inventory Area */}
      <header className="w-full pt-6 md:pt-10 flex flex-col items-center z-10 pointer-events-none">
        <h1 className="text-4xl md:text-5xl font-calligraphy text-stone-800 mb-4 opacity-90">{t.title}</h1>
        <div className="pointer-events-auto">
            <InventoryDisplay inventory={inventory} totalClicks={totalClicks} language={language} />
        </div>
      </header>

      {/* Main Interactive Area */}
      <main className="flex-1 w-full flex items-center justify-center relative perspective-container">
        
        {/* The Striker (Visual only) */}
        {/* Container positioned relative to the fish to allow "Resting" logic */}
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
             {/* 
                Responsive adjustments:
                Mobile: Use viewport units (min(50vw, ...)) to prevent overflow. 
                Reduced translate offsets on mobile so the Resting state doesn't push it off-screen.
             */}
             <div 
                className="relative transition-transform duration-300"
                style={{
                  width: 'min(50vw, 280px)',
                  height: 'min(50vw, 280px)',
                }}
             >
                <div className="w-full h-full transform translate-x-[2%] -translate-y-[2%] md:translate-x-[25%] md:-translate-y-[20%]">
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
                '--fish-size': 'min(65vw, 360px)', 
            } as React.CSSProperties}
        >
            {/* The Clickable Fish */}
            <div 
              ref={fishRef}
              onMouseDown={handleKnock}
              onTouchStart={handleKnock}
              className="w-full h-full relative cursor-pointer z-20 will-change-transform tap-highlight-transparent"
              style={{ transform: 'perspective(1000px) scale(1)' }}
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
                    transform: strikeTrigger % 2 !== 0 ? 'translate(-50%, 0) scale(0.95)' : 'translate(-50%, 0) scale(1)', // Simple visual feedback synced roughly with click
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
      <footer className="w-full pb-8 px-6 flex flex-col items-center z-10 space-y-6">
        
        {/* Zen Quote Display */}
        <div className="min-h-[80px] max-w-lg w-full text-center">
            {zenQuote && (
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-stone-200/50 shadow-lg animate-fade-in transition-all">
                    <p className="text-stone-800 font-calligraphy text-2xl leading-relaxed">
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
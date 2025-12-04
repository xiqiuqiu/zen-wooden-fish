import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WOODEN_FISH_IMG_URL, CONVERSION_RATES, TRANSLATIONS } from './constants';
import { FloatingText, Inventory, Language, ZenMomentContent } from './types';
import { audioService } from './services/audioService';
import { getZenWisdom, getZenMoment } from './services/geminiService';
import { Striker } from './components/Striker';
import { FloatingTextComp } from './components/FloatingText';
import { InventoryDisplay } from './components/InventoryDisplay';
import { ZenOverlay } from './components/ZenOverlay';

// Idle time in milliseconds (3 minutes)
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [strikeTrigger, setStrikeTrigger] = useState(0); // Counter to trigger animations
  const [isResting, setIsResting] = useState(true); // Default to resting state
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  // Footer Zen Quote state
  const [zenQuote, setZenQuote] = useState<string>("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  
  // Full Screen Zen Moment state
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenMomentContent, setZenMomentContent] = useState<ZenMomentContent | null>(null);
  const [isLoadingZenMoment, setIsLoadingZenMoment] = useState(false);

  const fishRef = useRef<HTMLDivElement>(null);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // For Striker resting
  const zenIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // For Zen Mode trigger

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

  // Function to enter Zen Mode
  const enterZenMode = useCallback(async () => {
    // If already in Zen mode or loading, do nothing
    if (isZenMode || isLoadingZenMoment) return;

    setIsZenMode(true);
    setIsLoadingZenMoment(true);
    
    // Fetch content
    const content = await getZenMoment(language);
    setZenMomentContent(content);
    setIsLoadingZenMoment(false);
  }, [isZenMode, isLoadingZenMoment, language]);

  // Unified Activity Monitor
  const resetActivityTimer = useCallback(() => {
    // 1. Handle Striker State (Visual)
    setIsResting(false);
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    activityTimerRef.current = setTimeout(() => {
      setIsResting(true); // Put striker back to rest after 3s
    }, 3000);

    // 2. Handle Zen Mode Timer (Feature)
    // If we are currently in Zen Mode, interaction should probably NOT close it automatically 
    // unless we decide that clicking anywhere exits Zen Mode. 
    // For now, let's say interaction resets the timer for the *next* Zen Mode, 
    // but doesn't auto-close the current one if it's open (the overlay handles its own close).
    if (!isZenMode) {
        if (zenIdleTimerRef.current) {
            clearTimeout(zenIdleTimerRef.current);
        }
        zenIdleTimerRef.current = setTimeout(() => {
            enterZenMode();
        }, IDLE_TIMEOUT_MS);
    }
  }, [enterZenMode, isZenMode]);

  // Initial setup for the idle timer
  useEffect(() => {
    resetActivityTimer();
    return () => {
        if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
        if (zenIdleTimerRef.current) clearTimeout(zenIdleTimerRef.current);
    };
  }, [resetActivityTimer]);

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
    setZenQuote(""); 
    resetActivityTimer();
  };

  const handleCloseZenMode = () => {
    setIsZenMode(false);
    setZenMomentContent(null);
    resetActivityTimer(); // Restart timer upon return
  };

  const handleKnock = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    resetActivityTimer();

    // 1. Audio
    audioService.playKnock();

    // 2. Visuals
    setStrikeTrigger(prev => prev + 1);

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

    if (navigator.vibrate) {
      navigator.vibrate(10); 
    }
  }, [resetActivityTimer, language]); 

  const handleSeekWisdom = async () => {
    if (isLoadingQuote) return;
    setIsLoadingQuote(true);
    setZenQuote(language === 'zh' ? "参悟中..." : "Meditating...");
    resetActivityTimer();
    const quote = await getZenWisdom(totalClicks, language);
    setZenQuote(quote);
    setIsLoadingQuote(false);
  };

  return (
    <div 
      className="h-[100dvh] bg-[#F7F5F2] flex flex-col items-center overflow-hidden touch-none select-none relative"
      onPointerMove={handleInteractionStart}
      onPointerDown={handleInteractionStart}
    >
      
      {/* Zen Moment Overlay */}
      <ZenOverlay 
        isVisible={isZenMode} 
        content={zenMomentContent} 
        isLoading={isLoadingZenMoment}
        onClose={handleCloseZenMode}
      />

      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-stone-200/50 backdrop-blur-sm hover:bg-stone-300/50 text-stone-600 rounded-full font-serif text-xs md:text-sm transition-all border border-stone-300/50"
      >
        {language === 'zh' ? 'EN' : '中'}
      </button>

      {/* Dev Trigger for Zen Moment (For Testing) */}
      <button 
        onClick={(e) => { e.stopPropagation(); enterZenMode(); }}
        className="fixed top-4 left-4 z-50 px-3 py-1 bg-stone-800/10 hover:bg-stone-800/20 text-stone-500 rounded-full font-serif text-xs transition-all border border-stone-300/50"
        title="Zen Moment"
      >
        {language === 'zh' ? '窥禅' : 'Zen'}
      </button>

      {/* Header */}
      <header className="w-full pt-4 md:pt-6 flex flex-col items-center z-10 pointer-events-none flex-none">
        <h1 className="text-3xl md:text-5xl font-calligraphy text-stone-800 mb-2 md:mb-4 opacity-90">{t.title}</h1>
        <div className="pointer-events-auto">
            <InventoryDisplay inventory={inventory} totalClicks={totalClicks} language={language} />
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow w-full flex items-center justify-center relative perspective-container mx-h-50">
        
        {/* Striker */}
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
             <div 
                className="relative transition-transform duration-300"
                style={{
                  width: 'min(50vw, 280px, 35vh)',
                  height: 'min(50vw, 280px, 35vh)',
                }}
             >
                <div className="w-full h-full transform translate-x-[14%] translate-y-[2%] md:translate-x-[25%] md:-translate-y-[20%]">
                  <Striker strikeTrigger={strikeTrigger} isResting={isResting} />
                </div>
             </div>
        </div>

        {/* Wooden Fish */}
        <div 
            className="relative flex items-center justify-center group"
            style={{
                width: 'var(--fish-size)',
                height: 'var(--fish-size)',
                '--fish-size': 'min(65vw, 450px, 50vh)', 
            } as React.CSSProperties}
        >
            <div 
              ref={fishRef}
              onPointerDown={handleKnock}
              className="w-full h-full relative cursor-pointer z-20 will-change-transform"
              style={{ 
                  transform: 'perspective(1000px) scale(1)',
                  touchAction: 'manipulation'
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
            
            <div 
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-black/10 blur-2xl rounded-[100%] pointer-events-none transition-all duration-100"
                style={{
                    transform: strikeTrigger % 2 !== 0 ? 'translate(-50%, 0) scale(0.95)' : 'translate(-50%, 0) scale(1)', 
                    opacity: 0.2
                }}
            />
        </div>

        {floatingTexts.map(ft => (
          <FloatingTextComp key={ft.id} {...ft} />
        ))}
      </main>

      {/* Footer */}
      <footer className="w-full pb-4 md:pb-6 px-6 flex flex-col items-center z-10 space-y-3 md:space-y-5 flex-none">
        
        {/* Zen Quote Display */}
        <div className="min-h-[60px] md:min-h-[80px] max-w-lg w-full text-center relative">
            {zenQuote && (
                <div className="relative bg-white/60 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-stone-200/50 shadow-lg animate-fade-in transition-all group">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setZenQuote(""); }}
                        className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200/30 rounded-full transition-colors z-20"
                        title={language === 'zh' ? "关闭" : "Close"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
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
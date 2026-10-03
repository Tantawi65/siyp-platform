import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Search } from 'lucide-react';

const AIAppleShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const { top, height } = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalScroll = height - windowHeight;
          const currentScroll = -top;
          
          let p = currentScroll / totalScroll;
          p = Math.max(0, Math.min(1, p));
          setProgress(p);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to map a sub-range of progress to a value
  const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    if (val <= inMin) return outMin;
    if (val >= inMax) return outMax;
    return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
  };

  // --- Animations ---
  
  // 1. Initial Title Fade Out
  const titleOpacity = mapRange(progress, 0, 0.1, 1, 0);
  const titleY = mapRange(progress, 0, 0.1, 0, -50);

  // 2. Chat Interface Scale & Tilt In
  const interfaceScale = mapRange(progress, 0, 0.15, 0.8, 1);
  const interfaceY = mapRange(progress, 0, 0.15, 100, 0);
  const interfaceRotateX = mapRange(progress, 0, 0.15, 20, 0);

  // 3. User Message slides in
  const userMsgOpacity = mapRange(progress, 0.15, 0.25, 0, 1);
  const userMsgX = mapRange(progress, 0.15, 0.25, 50, 0);

  // 4. AI Scanning state
  const scanOpacity = mapRange(progress, 0.3, 0.4, 0, 1) - mapRange(progress, 0.5, 0.55, 0, 1);
  
  // 5. AI Results slide up
  const resultsOpacity = mapRange(progress, 0.55, 0.65, 0, 1);
  const resultsY = mapRange(progress, 0.55, 0.65, 40, 0);

  // 6. Final CTA & Glow
  const ctaOpacity = mapRange(progress, 0.75, 0.85, 0, 1);
  const ctaY = mapRange(progress, 0.75, 0.85, 30, 0);
  const glowOpacity = mapRange(progress, 0.75, 0.9, 0, 0.8);

  return (
    <div ref={containerRef} className="relative bg-[#071A13]" style={{ height: '250vh' }}>
      
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center perspective-[1000px]">
        
        {/* Background ambient glow */}
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{ 
            background: 'radial-gradient(circle at 50% 50%, rgba(27,84,66,0.3) 0%, rgba(7,26,19,1) 60%)',
            opacity: 0.5 + glowOpacity * 0.5
          }} 
        />

        {/* Initial Title */}
        <div 
          className="absolute top-[30%] left-0 w-full text-center px-4"
          style={{ 
            opacity: titleOpacity, 
            transform: `translateY(${titleY}px)`,
            pointerEvents: progress > 0.1 ? 'none' : 'auto'
          }}
        >
          <h2 className="text-5xl md:text-7xl font-black text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Let AI do the work.
          </h2>
        </div>

        {/* The Chat Interface Window */}
        <div 
          className="relative w-[90%] max-w-4xl rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
          style={{
            transform: `scale(${interfaceScale}) translateY(${interfaceY}px) rotateX(${interfaceRotateX}deg)`,
            transformOrigin: 'bottom center',
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(27, 84, 66, ${glowOpacity * 0.4})`
          }}
        >
          {/* Mac-style Window Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="p-6 md:p-10 min-h-[360px] flex flex-col justify-start relative">
            
            {/* User Message */}
            <div 
              className="flex justify-end mb-8"
              style={{ 
                opacity: userMsgOpacity, 
                transform: `translateX(${userMsgX}px)` 
              }}
            >
              <div className="bg-[#1B5442] text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-lg">
                <p className="text-lg md:text-xl font-medium">
                  Find me fully-funded fellowships.
                </p>
              </div>
            </div>

            {/* AI Scanning State (Purely Visual) */}
            <div 
              className="absolute left-6 md:left-10 top-[120px] md:top-[140px] flex flex-col gap-3 w-3/4 max-w-md"
              style={{ 
                opacity: scanOpacity,
                display: progress > 0.6 ? 'none' : 'flex'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#E8A857] animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-3 bg-white/10 rounded w-full animate-pulse delay-75"></div>
              <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse delay-150"></div>
              <div className="h-3 bg-white/10 rounded w-4/6 animate-pulse delay-300"></div>
            </div>

            {/* AI Results */}
            <div 
              className="flex justify-start w-full"
              style={{ 
                opacity: resultsOpacity, 
                transform: `translateY(${resultsY}px)` 
              }}
            >
              <div className="w-full max-w-[95%]">
                
                {/* The Visual Table Representation */}
                <div className="overflow-hidden rounded-2xl border border-[#1B5442]/50 bg-black/40 shadow-2xl backdrop-blur-xl">
                  {[
                    { name: 'TechBridge Global Fellowship', tag: 'Fully Funded' },
                    { name: 'MENA Future Leaders', tag: 'Stipend Included' },
                    { name: 'Cairo Innovators Grant', tag: 'Travel Covered' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <CheckCircle2 size={24} className="text-[#2A7A60] shrink-0" />
                        <span className="text-white text-lg font-medium">{row.name}</span>
                      </div>
                      <span className="bg-[#E8A857]/20 text-[#E8A857] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>

          </div>
        </div>

        {/* Final CTA */}
        <div 
          className="absolute bottom-10 left-0 w-full flex justify-center z-20 pointer-events-none"
          style={{ 
            opacity: ctaOpacity, 
            transform: `translateY(${ctaY}px)`,
            pointerEvents: progress > 0.8 ? 'auto' : 'none'
          }}
        >
          <Link 
            to="/ai-mentor" 
            className="group flex items-center gap-3 bg-white text-[#071A13] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Try it with your profile
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AIAppleShowcase;

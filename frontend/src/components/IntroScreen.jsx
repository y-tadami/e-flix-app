import React, { useEffect } from 'react';

const IntroScreen = ({ onEnd }) => {
  useEffect(() => {
    const audio = new Audio('/E-FLIXイントロだだーん.mp4');
    audio.play().catch(() => {});
    const timer = setTimeout(onEnd, 2000);
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <span
        className="text-red-600 text-6xl md:text-8xl font-sans font-bold tracking-widest animate-estyle-fade"
        style={{ letterSpacing: '0.15em' }}
      >
        ESTYLE
      </span>
      <style>{`
        .animate-estyle-fade {
          animation: estyleFadeIn 1.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes estyleFadeIn {
          0%   { opacity: 0; transform: scale(0.95); letter-spacing: 0.4em; }
          60%  { opacity: 1; transform: scale(1.05); letter-spacing: 0.12em; }
          100% { opacity: 1; transform: scale(1);    letter-spacing: 0.15em; }
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;

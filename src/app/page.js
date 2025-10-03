
'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import StarField from './components/StarField';
import Navigation from './components/Navigation';
import InfoPanel from './components/InfoPanel';
import ExoplanetViewer from './components/ExoplanetViewer';
import { exoplanets } from './data/exoplanets';

export default function ExoplanetExplorer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPlanet = exoplanets[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % exoplanets.length);
        setIsTransitioning(false);
      }, 800);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const navigatePlanet = (direction) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => (prev + 1) % exoplanets.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + exoplanets.length) % exoplanets.length);
      }
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <StarField />

      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${currentPlanet.color}40 0%, transparent 70%)`,
          opacity: isTransitioning ? 0.3 : 0.6
        }}
      />

      <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Main Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="absolute left-16 top-1/2 -translate-y-1/2 max-w-md z-30">
          <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
            Explore<br />the<br />Universe
          </h1>
          
          <div className="flex gap-8 mt-8 text-white/50 text-sm">
            {exoplanets.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(idx);
                    setIsTransitioning(false);
                  }, 800);
                }}
                className={`hover:text-white transition-colors ${
                  idx === currentIndex ? 'text-white' : ''
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        <ExoplanetViewer planet={currentPlanet} isTransitioning={isTransitioning} />
        <InfoPanel planet={currentPlanet} />
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-16 flex items-center gap-8 z-30">
        <button className="text-white/70 hover:text-white text-sm transition-colors">
          About
        </button>
        <ChevronDown className="w-5 h-5 text-white/70 animate-bounce" />
      </div>

      {/* Bottom Right Signature */}
      <div className="absolute bottom-8 right-16 text-white/30 text-sm font-bold z-30">
        EXO
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-1/2 bottom-20 -translate-x-1/2 flex gap-4 z-30">
        <button
          onClick={() => navigatePlanet('prev')}
          className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          ←
        </button>
        <button
          onClick={() => navigatePlanet('next')}
          className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
}
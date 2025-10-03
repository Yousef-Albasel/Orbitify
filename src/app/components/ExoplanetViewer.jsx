'use client';
import Image from "next/image";

export default function ExoplanetViewer({ planet, isTransitioning }) {
  return (
    <div className="relative w-[600px] h-[600px] transition-all duration-1000">
      {/* Outer glow effect */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
          isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
        style={{
          background: `radial-gradient(circle, ${planet.color}40 0%, ${planet.color}20 40%, transparent 70%)`,
          transform: isTransitioning ? 'scale(0.9)' : 'scale(1.15)',
        }}
      />

      {/* Planet container */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
        style={{
          transform: isTransitioning ? 'scale(0.9) rotate(10deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        {/* Planet image with border glow */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            boxShadow: `0 0 60px ${planet.color}80, 0 0 120px ${planet.color}40, inset 0 0 80px rgba(0,0,0,0.4)`
          }}
        >
    <div className="relative w-[600px] h-[600px] overflow-hidden">
    <Image
        src={planet.image}
        alt={planet.name}
        fill
        className="object-cover absolute"
        style={{
        filter: 'brightness(1.1) contrast(1.2)',
        transform: 'scale(1.2)',
        top: '-7%',
        }}
        priority
    />
    </div>

          

          {/* Inner shadow for depth */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `inset 0 0 100px rgba(0,0,0,0.5), inset -20px -20px 80px rgba(0,0,0,0.3)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
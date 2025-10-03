'use client';

export default function InfoPanel({ planet }) {
  return (
    <div className="absolute right-16 top-1/2 -translate-y-1/2 space-y-8 z-30">
      <div className="text-right group cursor-pointer hover:translate-x-2 transition-transform">
        <div className="text-white/50 text-sm mb-1">Discovery</div>
        <div className="text-white text-xl font-light">
          {planet.name}
        </div>
      </div>

      <div className="text-right group cursor-pointer hover:translate-x-2 transition-transform">
        <div className="text-white/50 text-sm mb-1">Classification</div>
        <div className="text-white text-xl font-light">
          {planet.type}
        </div>
      </div>

      <div className="text-right group cursor-pointer hover:translate-x-2 transition-transform">
        <div className="text-white/50 text-sm mb-1">Distance</div>
        <div className="text-white text-xl font-light">
          {planet.distance}
        </div>
      </div>

      <div className="text-right group cursor-pointer hover:translate-x-2 transition-transform">
        <div className="text-white/50 text-sm mb-1">Details</div>
        <div className="text-white text-xl font-light max-w-xs">
          {planet.description}
        </div>
      </div>
    </div>
  );
}

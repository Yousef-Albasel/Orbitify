'use client';

export default function ProblemSection() {
  return (
    <section id="problem" className="relative bg-gradient-to-b from-black via-gray-900 to-black py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="mb-24">
          <h2 className="text-6xl font-bold text-white mb-6 tracking-tight">The Challenge</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-8"></div>
          <p className="text-white/70 text-2xl max-w-3xl font-light">
            Discovering exoplanets in vast astronomical datasets is like finding needles in a cosmic haystack
          </p>
        </div>

        <div className="space-y-20">
          <div className="flex items-start gap-12">
            <div className="flex-shrink-0">
              <div className="text-8xl font-bold text-white/10">01</div>
            </div>
            <div className="flex-1 pt-4">
              <h3 className="text-3xl font-bold text-white mb-4">Data Overload</h3>
              <p className="text-white/60 text-lg leading-relaxed">
                NASA missions generate terabytes of light curve data that need manual analysis. 
                The sheer volume makes it impossible for astronomers to review every signal.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-12">
            <div className="flex-shrink-0">
              <div className="text-8xl font-bold text-white/10">02</div>
            </div>
            <div className="flex-1 pt-4">
              <h3 className="text-3xl font-bold text-white mb-4">Time Intensive</h3>
              <p className="text-white/60 text-lg leading-relaxed">
                Astronomers spend countless hours identifying transit signals manually, 
                slowing down the pace of discovery and limiting research capacity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-12">
            <div className="flex-shrink-0">
              <div className="text-8xl font-bold text-white/10">03</div>
            </div>
            <div className="flex-1 pt-4">
              <h3 className="text-3xl font-bold text-white mb-4">Hidden Discoveries</h3>
              <p className="text-white/60 text-lg leading-relaxed">
                Potential exoplanets remain undiscovered in archived datasets, 
                waiting for advanced tools to reveal their existence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

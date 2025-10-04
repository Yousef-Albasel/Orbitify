'use client';

export default function SolutionSection() {
  return (
    <section id="solution" className="relative bg-black py-32 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="mb-24">
          <h2 className="text-6xl font-bold text-white mb-6 tracking-tight">Our Solution</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-8"></div>
          <p className="text-white/70 text-2xl max-w-3xl font-light">
            AI-powered exoplanet detection that transforms how we explore the cosmos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-32 items-center">
          <div className="space-y-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <h3 className="text-3xl font-bold text-white">AI Classification</h3>
              </div>
              <p className="text-white/60 text-lg leading-relaxed pl-6">
                Machine learning models trained on NASA data automatically detect exoplanet 
                transit signals with high accuracy, processing thousands of light curves in seconds.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <h3 className="text-3xl font-bold text-white">Interactive Visualization</h3>
              </div>
              <p className="text-white/60 text-lg leading-relaxed pl-6">
                Explore discoveries through an intuitive 3D interface that makes complex 
                astronomical data accessible to everyone, from researchers to students.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                <h3 className="text-3xl font-bold text-white">Real-Time Analysis</h3>
              </div>
              <p className="text-white/60 text-lg leading-relaxed pl-6">
                Process new observations instantly, accelerating the pace of astronomical 
                discovery and enabling faster response to interesting findings.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
            <div className="relative aspect-square">
              <div className="absolute inset-0 border border-white/10 rounded-full"></div>
              <div className="absolute inset-8 border border-white/10 rounded-full"></div>
              <div className="absolute inset-16 border border-white/10 rounded-full"></div>
              <div className="absolute inset-24 border border-white/10 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
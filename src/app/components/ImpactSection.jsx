'use client';

export default function ImpactSection() {
  return (
    <section id="impact" className="relative bg-gradient-to-b from-black via-purple-950/10 to-black py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-24">
          <h2 className="text-6xl font-bold text-white mb-6 tracking-tight">Impact & Why It Matters</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-8"></div>
          <p className="text-white/70 text-2xl max-w-4xl font-light italic">
            The search for exoplanets is more than a scientific pursuit. It's humanity's quest 
            to answer the timeless question: Are we alone in the universe?
          </p>
        </div>

        <div className="space-y-20">
          <div className="border-l-2 border-blue-500/50 pl-12">
            <h3 className="text-3xl font-bold text-white mb-4">Empowering Researchers</h3>
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
              By automating classification with AI/ML, astronomers save time and can focus on 
              deeper analysis rather than manual filtering. This accelerates the entire research pipeline.
            </p>
          </div>

          <div className="border-l-2 border-purple-500/50 pl-12">
            <h3 className="text-3xl font-bold text-white mb-4">Expanding Discovery</h3>
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
              With NASA's Kepler, K2, and TESS data, our tool can uncover new planetary candidates 
              hidden in massive datasets, potentially revealing thousands of new worlds.
            </p>
          </div>

          <div className="border-l-2 border-pink-500/50 pl-12">
            <h3 className="text-3xl font-bold text-white mb-4">Engaging the Public</h3>
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
              An interactive, user-friendly interface makes cutting-edge science accessible to 
              students, educators, and enthusiasts, democratizing space exploration.
            </p>
          </div>

          <div className="border-l-2 border-orange-500/50 pl-12">
            <h3 className="text-3xl font-bold text-white mb-4">Inspiring the Future</h3>
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
              Encouraging global curiosity about space exploration, fueling innovation, and 
              motivating the next generation of scientists and engineers.
            </p>
          </div>
        </div>

        <div className="mt-32 text-center">
          <p className="text-white/80 text-xl max-w-4xl mx-auto leading-relaxed">
            By combining NASA's open data with AI, our project bridges the gap between{' '}
            <span className="text-blue-400 font-semibold">big science and everyday explorers</span>
         making the discovery of new worlds not just a NASA mission, but a{' '}
            <span className="text-purple-400 font-semibold">shared human adventure</span>.
          </p>
        </div>
      </div>
    </section>
  );
}


// DataSourcesSection.jsx
'use client';
import { ArrowRight } from 'lucide-react';

export default function DataSourcesSection() {
  return (
    <section id="data" className="relative bg-gradient-to-b from-black to-gray-900 py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-24">
          <h2 className="text-6xl font-bold text-white mb-6 tracking-tight">NASA Data Sources</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-8"></div>
          <p className="text-white/70 text-2xl max-w-3xl font-light">
            Powered by cutting-edge space missions and open astronomical datasets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 mb-24">
          <div className="group">
            <div className="mb-6">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xl rounded-lg">
                KOI
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
              Kepler Mission
            </h3>
            <p className="text-white/60 text-lg leading-relaxed">
              Objects of Interest from the Kepler Space Telescope. Over 2,600 confirmed 
              exoplanets discovered through transit photometry.
            </p>
          </div>

          <div className="group">
            <div className="mb-6">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-xl rounded-lg">
                TOI
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
              TESS Mission
            </h3>
            <p className="text-white/60 text-lg leading-relaxed">
              TESS Objects of Interest from the all-sky survey. Monitoring 200,000 of 
              the brightest stars near the sun for transiting exoplanets.
            </p>
          </div>

          <div className="group">
            <div className="mb-6">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-xl rounded-lg">
                K2
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">
              K2 Mission
            </h3>
            <p className="text-white/60 text-lg leading-relaxed">
              Extended Kepler observations across multiple fields. Continued exoplanet 
              discoveries with a reimagined mission approach.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button className="group px-10 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-100 transition-all inline-flex items-center gap-3">
            Explore Exoplanets
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
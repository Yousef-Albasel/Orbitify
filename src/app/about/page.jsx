'use client';

import { useState } from 'react';
import { Telescope, Cpu, Database, Zap, Users, Globe } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const teamMembers = [
    {
      name: "Yousef Albasel",
      role: "Team Lead",
      bio: "Computer Science Student at Cairo University"
    },
    {
      name: "Mohamed Ahmed",
      role: "ML Engineer",
      bio: "Mathmatics and Computer Science Student at Helwan University"
    },
    {
      name: "Anas Taha Yahya",
      role: "ML Engineer",
      bio: "Mathmatics and Computer Science Student at Helwan University"
    }
  ];

  const technologies = [
    {
      icon: <Cpu className="w-8 h-8" />,
      name: "Machine Learning",
      description: "Advanced neural networks trained on NASA's Kepler, K2, and TESS datasets"
    },
    {
      icon: <Database className="w-8 h-8" />,
      name: "NASA Data",
      description: "Direct integration with official NASA exoplanet archives and databases"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      name: "Real-Time Processing",
      description: "Lightning-fast analysis of light curve data with instant results"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      name: "Web Platform",
      description: "Accessible from anywhere, no installation required"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(80)].map((_, i) => (
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
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold mb-6 tracking-tight">About Orbitify</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            <p className="text-white/70 text-2xl max-w-3xl mx-auto font-light">
              Bridging the gap between cutting-edge astronomy and artificial intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="relative max-w-6xl mx-auto px-6 mb-16">
        <div className="flex justify-center gap-4 border-b border-white/10">
          {['mission', 'technology', 'team'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-lg font-semibold capitalize transition-all duration-300 relative
                ${activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Mission Tab */}
      {activeTab === 'mission' && (
        <section className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <h2 className="text-5xl font-bold mb-6">Our Mission</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Orbitify was born from a simple yet powerful vision: to democratize the discovery 
                of exoplanets by combining NASA's treasure trove of astronomical data with the 
                latest advances in artificial intelligence.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                We believe that the search for new worlds shouldn't be limited to a select few. 
                By making powerful analytical tools accessible to researchers, students, and space 
                enthusiasts worldwide, we're accelerating humanity's journey to answer one of our 
                most profound questions: Are we alone?
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
                <Telescope className="w-24 h-24 text-blue-400 mb-6" />
                <h3 className="text-3xl font-bold mb-4">5,000+</h3>
                <p className="text-white/60">Exoplanets Discovered</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Accessible</h3>
              <p className="text-white/60 leading-relaxed">
                Making exoplanet research available to anyone with an internet connection
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fast</h3>
              <p className="text-white/60 leading-relaxed">
                Processing thousands of light curves in seconds with AI-powered analysis
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Open</h3>
              <p className="text-white/60 leading-relaxed">
                Built on open NASA data, contributing to the global scientific community
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Technology Tab */}
      {activeTab === 'technology' && (
        <section className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-bold mb-6">Technology Stack</h2>
            <p className="text-white/60 text-xl max-w-3xl mx-auto">
              Powered by state-of-the-art machine learning and NASA's astronomical databases
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-32">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{tech.name}</h3>
                <p className="text-white/60 leading-relaxed">{tech.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h3 className="text-3xl font-bold mb-8 text-center">The Process</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h4 className="font-semibold mb-2">Data Input</h4>
                <p className="text-white/60 text-sm">Upload light curve data</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-400">2</span>
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-white/60 text-sm">ML models detect patterns</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-400">3</span>
                </div>
                <h4 className="font-semibold mb-2">Classification</h4>
                <p className="text-white/60 text-sm">Identify exoplanet signals</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-400">4</span>
                </div>
                <h4 className="font-semibold mb-2">Visualization</h4>
                <p className="text-white/60 text-sm">Interactive 3D results</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <section className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-white/60 text-xl max-w-3xl mx-auto">
              A diverse group of astronomers, engineers, and designers united by a passion for space exploration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"></div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    <p className="text-blue-400 mb-3">{member.role}</p>
                    <p className="text-white/60 leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-32 text-center">
            <h3 className="text-3xl font-bold mb-6">Join Our Mission</h3>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              We're always looking for talented individuals who share our passion for space exploration and technology
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
              <a href='https://www.linkedin.com/in/yousef-albasel-3040a0260/'> View Open Positions</a>
            </button>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="relative max-w-6xl mx-auto px-6 py-32">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-16 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Explore?</h2>
          <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">
            Start discovering exoplanets with our AI-powered platform
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}
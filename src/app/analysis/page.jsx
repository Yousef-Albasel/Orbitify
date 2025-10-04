'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FileText, Download, ArrowLeft, TrendingUp, Activity, Target, Zap, AlertTriangle, CheckCircle2, Globe, Info } from 'lucide-react';
import * as THREE from 'three';

export default function AnalysisPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExoplanet, setSelectedExoplanet] = useState(0);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('predictions');
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  // Three.js 3D Visualization
  // Replace the Three.js useEffect (around line 39) with this:
useEffect(() => {
  if (!canvasRef.current || !results?.exoplanet_details?.[selectedExoplanet] || activeTab !== 'visualization') return;

  const exoplanet = results.exoplanet_details[selectedExoplanet];
  
  // Clear previous scene
  if (sceneRef.current) {
    if (sceneRef.current.animationId) {
      cancelAnimationFrame(sceneRef.current.animationId);
    }
    if (sceneRef.current.renderer) {
      sceneRef.current.renderer.dispose();
    }
    while(canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75, 
    canvasRef.current.clientWidth / canvasRef.current.clientHeight, 
    0.1, 
    10000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  
  renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
  canvasRef.current.appendChild(renderer.domElement);

  // Rest of your Three.js code stays the same...
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);

  const earthRadius = 1;
  const exoplanetRadius = Math.cbrt(exoplanet.planet_volume_earth) * earthRadius;
  const starRadius = Math.cbrt(exoplanet.star_volume_solar) * earthRadius * 109;

  const maxRadius = Math.max(earthRadius, exoplanetRadius, starRadius);
  const scaleFactor = 15 / maxRadius;

  const earthSize = earthRadius * scaleFactor;
  const exoplanetSize = exoplanetRadius * scaleFactor;
  const starSize = Math.min(starRadius * scaleFactor, 40);

  const earthGeometry = new THREE.SphereGeometry(earthSize, 32, 32);
  const earthMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x2563eb,
    emissive: 0x1e40af,
    shininess: 30
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.x = -30;
  scene.add(earth);

  const exoplanetGeometry = new THREE.SphereGeometry(exoplanetSize, 32, 32);
  const exoplanetMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x10b981,
    emissive: 0x059669,
    shininess: 30
  });
  const exoplanetMesh = new THREE.Mesh(exoplanetGeometry, exoplanetMaterial);
  exoplanetMesh.position.x = 0;
  scene.add(exoplanetMesh);

  const starGeometry = new THREE.SphereGeometry(starSize, 32, 32);
  const starMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.5,
    shininess: 100
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.position.x = 50;
  scene.add(starMesh);

  camera.position.z = 80;
  camera.position.y = 20;
  camera.lookAt(0, 0, 0);

  let animationId;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    
    earth.rotation.y += 0.005;
    exoplanetMesh.rotation.y += 0.003;
    starMesh.rotation.y += 0.001;
    
    renderer.render(scene, camera);
  };
  animate();

  sceneRef.current = { scene, camera, renderer, animationId };

  return () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
  };
}, [results, selectedExoplanet, activeTab]);

  const handleDownload = () => {
    if (!results || !results.preview) return;
    
    const headers = Object.keys(results.preview[0]);
    const csvContent = [
      headers.join(','),
      ...results.preview.map(row => 
        headers.map(header => row[header]).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exoplanet_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-xl text-white/60 mb-6">No analysis data found. Please upload a file first.</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Exoplanet', value: results.exoplanets || 0 },
    { name: 'False Positive', value: (results.total || 0) - (results.exoplanets || 0) }
  ];
  const COLORS = ['#4ade80', '#f87171'];

  const probDistribution = results.preview?.map((row, i) => ({
    name: `Sample ${i+1}`,
    Probability: Math.round(row.Probability * 100),
    Type: row.Prediction
  })) || [];

  const modelMetrics = [
    { metric: 'Accuracy', value: 99, fullMark: 100 },
    { metric: 'Precision', value: 98, fullMark: 100 },
    { metric: 'Recall', value: 98, fullMark: 100 },
    { metric: 'F1-Score', value: 98, fullMark: 100 },
  ];

    const detectionRate = results.total > 0 ? ((results.exoplanets / results.total) * 100).toFixed(1) : 0;
    const falsePositiveRate = results.total > 0 ? (((results.total - results.exoplanets) / results.total) * 100).toFixed(1) : 0;

    const falsePositives = results.preview?.map((row, originalIdx) => ({
    ...row,
    index: originalIdx
    })).filter(row => row.Prediction === 'FALSE POSITIVE') || [];
    console.log("False positives are ", falsePositives);
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 opacity-20">
        {[...Array(60)].map((_, i) => (
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2">Analysis Dashboard</h1>
            <p className="text-white/60">Deep dive into your exoplanet detection results</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> New Analysis
          </button>
        </div>

        {/* File Info Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-xl">{results.filename || "Analysis Results"}</p>
              <p className="text-white/60 text-sm">
                {results.total || 0} samples • Analyzed {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-blue-400 text-sm font-semibold">TOTAL</span>
            </div>
            <p className="text-4xl font-bold mb-1">{results.total || 0}</p>
            <p className="text-white/60 text-sm">Samples Analyzed</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">DETECTED</span>
            </div>
            <p className="text-4xl font-bold mb-1">{results.exoplanets || 0}</p>
            <p className="text-white/60 text-sm">Exoplanets Found ({detectionRate}%)</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-8 h-8 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">CONFIDENCE</span>
            </div>
            <p className="text-4xl font-bold mb-1">{results.confidence || 0}%</p>
            <p className="text-white/60 text-sm">Average Score</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <span className="text-red-400 text-sm font-semibold">FALSE +</span>
            </div>
            <p className="text-4xl font-bold mb-1">{(results.total || 0) - (results.exoplanets || 0)}</p>
            <p className="text-white/60 text-sm">Non-Exoplanets ({falsePositiveRate}%)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-2 rounded-2xl border border-white/10 overflow-x-auto">
          {['overview', 'visualization', 'false-positives', 'model', 'detailed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                  : 'hover:bg-white/5'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Detection Ratio
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Probability Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={probDistribution.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="Probability" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'visualization' && (
          <div className="space-y-8">
            {results.exoplanet_details && results.exoplanet_details.length > 0 ? (
              <>
                {/* Exoplanet Selector */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Select Exoplanet
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {results.exoplanet_details.slice(0, 5).map((exo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedExoplanet(idx)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedExoplanet === idx
                            ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <p className="font-semibold text-sm truncate">{exo.kepoi_name}</p>
                        <p className="text-xs text-white/60 mt-1">{(exo.probability * 100).toFixed(1)}% conf.</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Visualization */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6">3D Scale Comparison</h3>
                  <div ref={canvasRef} className="w-full h-96 bg-black/50 rounded-xl overflow-hidden"></div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-semibold">Earth</p>
                        <p className="text-xs text-white/60">Reference (1 R⊕)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="w-8 h-8 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-semibold">{results.exoplanet_details[selectedExoplanet].kepoi_name}</p>
                        <p className="text-xs text-white/60">
                          {results.exoplanet_details[selectedExoplanet].planet_radius_earth.toFixed(2)} R⊕
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <div className="w-8 h-8 rounded-full bg-yellow-500"></div>
                      <div>
                        <p className="font-semibold">Host Star</p>
                        <p className="text-xs text-white/60">
                          {results.exoplanet_details[selectedExoplanet].star_radius_solar.toFixed(2)} R☉
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/20">
                      <h4 className="font-semibold mb-4 text-green-400">Exoplanet Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Volume (Earth units):</span>
                          <span className="font-semibold">
                            {results.exoplanet_details[selectedExoplanet].planet_volume_earth.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Volume (km³):</span>
                          <span className="font-semibold">
                            {results.exoplanet_details[selectedExoplanet].planet_volume_km3.toExponential(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Detection Confidence:</span>
                          <span className="font-semibold text-green-400">
                            {(results.exoplanet_details[selectedExoplanet].probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-6 border border-yellow-500/20">
                      <h4 className="font-semibold mb-4 text-yellow-400">Host Star Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Volume (Solar units):</span>
                          <span className="font-semibold">
                            {results.exoplanet_details[selectedExoplanet].star_volume_solar.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Volume (km³):</span>
                          <span className="font-semibold">
                            {results.exoplanet_details[selectedExoplanet].star_volume_km3.toExponential(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Radius Ratio:</span>
                          <span className="font-semibold">
                            {(results.exoplanet_details[selectedExoplanet].star_radius_solar / 
                              results.exoplanet_details[selectedExoplanet].planet_radius_earth * 109).toFixed(1)}:1
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                <Globe className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-xl text-white/60">No confirmed exoplanets found in this dataset</p>
                <p className="text-sm text-white/40 mt-2">Upload a dataset with confirmed exoplanets to see the 3D visualization</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'false-positives' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-red-400" />
                Why These Signals Are False Positives
              </h3>
              
              {falsePositives.length > 0 ? (
                <div className="space-y-4">
                  {falsePositives.map((fp, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-6 border border-red-500/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">Sample #{fp.index + 1}</h4>
                          <p className="text-sm text-white/60">Confidence: {(fp.Probability * 100).toFixed(1)}%</p>
                        </div>
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                          False Positive
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4 mt-3">
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                          {fp.explanation || 'This signal was classified as a false positive through automated vetting procedures.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-xl text-white/60">No false positives detected in preview</p>
                  <p className="text-sm text-white/40 mt-2">All analyzed samples appear to be valid exoplanet candidates</p>
                </div>
              )}
            </div>

            {/* Common False Positive Indicators */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="font-semibold mb-4">Common False Positive Indicators</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                    <div>
                      <p className="font-semibold text-sm">Non-Transit Light Curve</p>
                      <p className="text-xs text-white/60">Signal shape doesn't match expected transit profile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                    <div>
                      <p className="font-semibold text-sm">Stellar Scintillation</p>
                      <p className="text-xs text-white/60">Source offset suggests background star interference</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                    <div>
                      <p className="font-semibold text-sm">Centroid Offset</p>
                      <p className="text-xs text-white/60">Light center shifts during transit (nearby star)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                    <div>
                      <p className="font-semibold text-sm">Eclipsing Binary</p>
                      <p className="text-xs text-white/60">Light curve matches binary star system pattern</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                <h4 className="font-semibold mb-4">Vetting Process</h4>
                <p className="text-sm text-white/70 mb-4">
                  Each Kepler Object of Interest (KOI) undergoes rigorous automated and manual vetting to distinguish 
                  true exoplanets from astrophysical false positives.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-white/70">Automated flag analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-white/70">Light curve examination</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-white/70">Centroid motion analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">4</div>
                    <span className="text-white/70">Manual expert review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'model' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6">Model Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={modelMetrics}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis dataKey="metric" stroke="#888" />
                  <PolarRadiusAxis stroke="#888" />
                  <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Model Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Algorithm</span>
                    <span className="font-semibold">CatBoost Classifier</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Training Samples</span>
                    <span className="font-semibold">~6,000 KOIs</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Accuracy</span>
                    <span className="font-semibold">99%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/60">Features Used</span>
                    <span className="font-semibold">11 Selected</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/60">Model Version</span>
                    <span className="font-semibold">v1.0.0</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Model Status
                </h4>
                <p className="text-white/60 text-sm">Model is performing optimally. All systems operational.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-6">Detailed Predictions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 pr-4 text-white/60 font-semibold">#</th>
                    <th className="pb-3 pr-4 text-white/60 font-semibold">Prediction</th>
                    <th className="pb-3 pr-4 text-white/60 font-semibold">Probability</th>
                    <th className="pb-3 text-white/60 font-semibold">Confidence Level</th>
                  </tr>
                </thead>
                <tbody>
                  {results.preview?.map((row, idx) => {
                    const prob = row.Probability * 100;
                    const confidence = prob >= 80 ? 'High' : prob >= 60 ? 'Medium' : 'Low';
                    const confidenceColor = prob >= 80 ? 'text-green-400' : prob >= 60 ? 'text-yellow-400' : 'text-red-400';
                    
                    return (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4 text-white/60">{idx + 1}</td>
                        <td className="py-4 pr-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            row.Prediction === 'CONFIRMED' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {row.Prediction}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/10 rounded-full h-2 max-w-32">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                style={{ width: `${prob}%` }}
                              />
                            </div>
                            <span className="font-semibold">{prob.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`font-semibold ${confidenceColor}`}>{confidence}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
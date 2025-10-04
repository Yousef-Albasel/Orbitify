'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FileText, Download, ArrowLeft } from 'lucide-react';

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Example: fetch from sessionStorage or API if you redirect with query/file ID
    const stored = sessionStorage.getItem('predictions');
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl text-white/60">No analysis data found. Please upload a file first.</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Exoplanet', value: results.exoplanets || 0 },
    { name: 'Non-Exoplanet', value: (results.total || 0) - (results.exoplanets || 0) }
  ];
  const COLORS = ['#4ade80', '#f87171'];

  const probDistribution = results.preview?.map((row, i) => ({
    name: `#${i+1}`,
    Probability: Math.round(row.Probability * 100)
  })) || [];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Effects */}
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
      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-bold">Analysis Dashboard</h1>
          <a 
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Upload
          </a>
        </div>

        {/* File Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12 flex items-center gap-4">
          <FileText className="w-10 h-10 text-blue-400" />
          <div>
            <p className="font-semibold text-lg">{results.filename || "Uploaded CSV"}</p>
            <p className="text-white/60 text-sm">
              {results.total || 0} samples analyzed • {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <p className="text-white/60 mb-2">Total Samples</p>
            <p className="text-4xl font-bold text-blue-400">{results.total || 0}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <p className="text-white/60 mb-2">Exoplanets Detected</p>
            <p className="text-4xl font-bold text-green-400">{results.exoplanets || 0}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <p className="text-white/60 mb-2">Avg Confidence</p>
            <p className="text-4xl font-bold text-purple-400">{results.confidence || 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Exoplanet Ratio</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Probability Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={probDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="Probability" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Preview Table */}
        {results.preview && results.preview.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-xl font-bold mb-4">Detailed Predictions</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Prediction</th>
                  <th className="pb-3">Probability</th>
                </tr>
              </thead>
              <tbody>
                {results.preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white/60">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        row.Prediction === 'Exoplanet' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {row.Prediction}
                      </span>
                    </td>
                    <td className="py-3">{(row.Probability * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center mt-10">
          <button 
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Results
          </button>
        </div>
      </div>
    </div>
  );
}

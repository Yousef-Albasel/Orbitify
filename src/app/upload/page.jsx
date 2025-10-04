'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Prediction failed');
      }
      
      // Store results and redirect to analysis page
      data.filename = file.name;
      sessionStorage.setItem('predictions', JSON.stringify(data));
      
      setUploadStatus('success');
      
      // Redirect after brief delay to show success state
      setTimeout(() => {
        router.push('/analysis');
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Failed to process file. Please try again.');
      setUploadStatus('error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
      <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-6 tracking-tight">Upload Your Data</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-white/70 text-2xl max-w-3xl mx-auto font-light">
            Upload your CSV file containing light curve data to detect potential exoplanets
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-12">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            {!file ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Drag & Drop CSV File</h3>
                <p className="text-white/60 mb-6">or</p>
                <label
                  htmlFor="file-upload"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold cursor-pointer hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Browse Files
                </label>
                <p className="text-white/40 text-sm mt-6">Supported format: CSV (Max 100MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{file.name}</h4>
                    <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                  disabled={uploadStatus === 'uploading'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && uploadStatus === 'idle' && (
          <div className="text-center mb-12">
            <button
              onClick={handleUpload}
              className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Analyze Data
            </button>
          </div>
        )}

        {/* Loading State */}
        {uploadStatus === 'uploading' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
            <Loader className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
            <h3 className="text-2xl font-bold mb-3">Processing Your Data</h3>
            <p className="text-white/60">Our AI is analyzing the light curves...</p>
          </div>
        )}

        {/* Success State - Brief display before redirect */}
        {uploadStatus === 'success' && (
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-500/30 rounded-3xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-3">Analysis Complete!</h3>
            <p className="text-white/60">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Info Cards */}
        {uploadStatus === 'idle' && (
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Expected Format</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>CSV file with light curve time series data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Columns should include time stamps and flux measurements</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Compatible with Kepler, K2, and TESS data formats</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Upload your CSV file containing light curve data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Our ML model analyzes patterns in the data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Get instant predictions on potential exoplanet transits</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
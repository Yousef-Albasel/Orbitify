'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader, Brain, TrendingUp } from 'lucide-react';

export default function RetrainPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [retrainStatus, setRetrainStatus] = useState('idle');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
      setSuccessMessage('');
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
      setSuccessMessage('');
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setRetrainStatus('idle');
    setError('');
    setSuccessMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetrain = async () => {
    if (!file) return;

    setRetrainStatus('retraining');
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/retrain', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Retrain failed');
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Retraining failed');
      }
      
      setRetrainStatus('success');
      setSuccessMessage(data.message || 'Model retrained successfully!');
      
      // Reset after showing success
      setTimeout(() => {
        handleRemoveFile();
      }, 5000);
      
    } catch (err) {
      setError(err.message || 'Failed to retrain model. Please try again.');
      setRetrainStatus('error');
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

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10" />
          </div>
          <h1 className="text-7xl font-bold mb-6 tracking-tight">Retrain Model</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-8"></div>
          <p className="text-white/70 text-2xl max-w-3xl mx-auto font-light">
            Upload new training data to improve the model's accuracy and performance
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
                ? 'border-purple-500 bg-purple-500/10'
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
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Drag & Drop Training Data</h3>
                <p className="text-white/60 mb-6">or</p>
                <label
                  htmlFor="file-upload"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full font-semibold cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Browse Files
                </label>
                <p className="text-white/40 text-sm mt-6">Supported format: CSV (Max 100MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{file.name}</h4>
                    <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                  disabled={retrainStatus === 'retraining'}
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

          {successMessage && (
            <div className="mt-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Retrain Button */}
        {file && retrainStatus === 'idle' && (
          <div className="text-center mb-12">
            <button
              onClick={handleRetrain}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Brain className="w-5 h-5" />
              Start Retraining
            </button>
          </div>
        )}

        {/* Loading State */}
        {retrainStatus === 'retraining' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
            <Loader className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin" />
            <h3 className="text-2xl font-bold mb-3">Retraining Model</h3>
            <p className="text-white/60 mb-4">This may take several minutes...</p>
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {retrainStatus === 'success' && (
          <div className="bg-gradient-to-br from-green-500/10 to-purple-500/10 backdrop-blur-sm border border-green-500/30 rounded-3xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-3">Retraining Complete!</h3>
            <p className="text-white/60">The model has been updated with new training data</p>
          </div>
        )}

        {/* Info Cards */}
        {retrainStatus === 'idle' && (
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-bold">Training Data Requirements</h3>
              </div>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>CSV file with labeled exoplanet data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Must include 'koi_disposition' column (CONFIRMED/FALSE POSITIVE)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Same feature columns as original training data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Minimum 100 samples recommended for effective retraining</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-pink-400" />
                <h3 className="text-2xl font-bold">Retraining Process</h3>
              </div>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Upload CSV file with new labeled training examples</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Model fine-tunes on the new data using existing weights</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Updated model is saved and automatically loaded</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>All future predictions use the improved model</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Warning Notice */}
        <div className="mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Important Note</h4>
              <p className="text-white/70 text-sm">
                Retraining will update the model for all users. Ensure your training data is accurate and properly labeled. 
                The process may take several minutes depending on the dataset size. The model will be automatically updated 
                upon successful completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
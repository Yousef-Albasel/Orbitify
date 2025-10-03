'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Send, File, X, Loader2, FileText, Database, MessageSquare } from 'lucide-react';

// Simple markdown parser for assistant responses
const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Headers
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
  
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/30 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>');
  
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded text-sm">$1</code>');
  
  // Lists
  text = text.replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>');
  text = text.replace(/(<li class="ml-4">.*<\/li>)/s, '<ul class="my-2 space-y-1">$1</ul>');
  
  // Line breaks
  text = text.replace(/\n/g, '<br />');
  
  return text;
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload-pdfs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadedFiles(prev => [...prev, ...files.map(f => f.name)]);
        setFiles([]);
        setMessages(prev => [...prev, {
          role: 'system',
          content: `Successfully processed ${data.filesProcessed} PDF(s). The documents have been indexed and are ready for querying.`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error uploading files. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Animated Star Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none overflow-hidden">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 0.5 + 'px',
              height: Math.random() * 2 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.2,
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* PDF Manager Sidebar */}
      <div className={`relative ${sidebarOpen ? 'w-96' : 'w-0'} transition-all duration-500 border-r border-white/10 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-xl z-20`}>
        <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-500 h-full flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">

              <h2 className="text-2xl font-bold">Knowledge Base</h2>
            </div>
            <p className="text-sm text-white/50">Manage research documents</p>
          </div>

          {/* Upload Section */}
          <div className="p-6 border-b border-white/10">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-2xl transition-all duration-300 font-semibold"
            >
              <Upload className="w-5 h-5" />
              Upload PDFs
            </button>
          </div>

          {/* Selected Files for Upload */}
          {files.length > 0 && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white/70">Ready to Upload</span>
                <button
                  onClick={uploadFiles}
                  disabled={isProcessing}
                  className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing
                    </>
                  ) : (
                    `Upload (${files.length})`
                  )}
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-white/80 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indexed Documents */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-3">
              <span className="text-sm font-medium text-white/70">
                Indexed Documents ({uploadedFiles.length})
              </span>
            </div>
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No documents indexed yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedFiles.map((fileName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <File className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-white/80 truncate">{fileName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-r-2xl flex items-center justify-center transition-all duration-300 z-10"
        >
          <div className={`transform transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}>
            →
          </div>
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="p-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">
                Orbitify AI
              </h1>
            </div>
            <p className="text-white/50 text-lg font-light ml-16">
              Talk with Orbitify about the dataset, the state of the art papers or upload your own data.
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center max-w-2xl">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-4">Start Exploring</h3>
                  <p className="text-white/50 text-lg mb-10 font-light">
                    Ask me anything about exoplanets, detection methods, habitability, or specific research findings
                  </p>
                  <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <p className="text-white/60 font-semibold mb-4 text-left">Try asking:</p>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3 text-white/40 hover:text-white/70 transition-colors cursor-pointer group">
                        <span className="text-blue-400 group-hover:scale-110 transition-transform">→</span>
                        <span>What methods are used to detect exoplanets?</span>
                      </div>
                      <div className="flex items-start gap-3 text-white/40 hover:text-white/70 transition-colors cursor-pointer group">
                        <span className="text-purple-400 group-hover:scale-110 transition-transform">→</span>
                        <span>What makes an exoplanet potentially habitable?</span>
                      </div>
                      <div className="flex items-start gap-3 text-white/40 hover:text-white/70 transition-colors cursor-pointer group">
                        <span className="text-pink-400 group-hover:scale-110 transition-transform">→</span>
                        <span>Tell me about hot Jupiters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 shadow-lg shadow-blue-500/20'
                      : msg.role === 'system'
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-200 px-5 py-3'
                      : 'bg-gradient-to-br from-white/10 to-white/5 text-white px-6 py-5 border border-white/10 shadow-xl'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div 
                      className="prose prose-invert max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm px-8 py-5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-lg">
                  <div className="relative">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <div className="absolute inset-0 blur-md bg-blue-400/30"></div>
                  </div>
                  <span className="text-white/70 font-light">Analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-xl p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about exoplanets..."
                className="flex-1 bg-white/5 border border-white/20 rounded-2xl px-8 py-5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-300"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
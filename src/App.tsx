/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Play, 
  Download, 
  Info, 
  Maximize2, 
  X,
  History,
  LayoutGrid,
  Menu,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { enhancePrompt, generateImages } from './services/aiService';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
}

const ART_STYLES = [
  { id: 'none', label: 'None', preview: 'https://picsum.photos/seed/natural/200/200' },
  { id: 'cinematic', label: 'Cinematic', preview: 'https://picsum.photos/seed/movie/200/200' },
  { id: 'anime', label: 'Anime', preview: 'https://picsum.photos/seed/anime/200/200' },
  { id: 'cyberpunk', label: 'Cyberpunk', preview: 'https://picsum.photos/seed/neon/200/200' },
  { id: 'oil-painting', label: 'Oil Painting', preview: 'https://picsum.photos/seed/oil/200/200' },
  { id: '3d-render', label: '3D Render', preview: 'https://picsum.photos/seed/3d/200/200' },
  { id: 'minimalist', label: 'Minimal', preview: 'https://picsum.photos/seed/min/200/200' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square' },
  { id: '16:9', label: '16:9 Cinema' },
  { id: '9:16', label: '9:16 Portrait' },
  { id: '4:3', label: '4:3 Standard' },
  { id: '3:4', label: '3:4 Classic' },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const styleInstruction = selectedStyle !== 'none' ? ` in ${selectedStyle} style` : '';
      const finalPrompt = `${prompt}${styleInstruction}`;
      const urls = await generateImages(finalPrompt, aspectRatio);
      
      const newImages: GeneratedImage[] = urls.map((url, i) => ({
        id: crypto.randomUUID(),
        url,
        prompt: finalPrompt,
        timestamp: Date.now(),
        aspectRatio
      }));

      setGallery(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    const enhanced = await enhancePrompt(prompt);
    setPrompt(enhanced);
    setIsEnhancing(false);
  };

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="h-screen w-full bg-[#0c0c0e] font-sans text-slate-200 overflow-hidden relative flex flex-col">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-pink-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="h-16 flex items-center justify-between px-8 border-b border-white/10 backdrop-blur-md bg-white/5 relative z-10">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300 font-display">
            AURA ART
          </span>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="text-white">Generator</a>
            <a href="#" className="hover:text-white transition-colors">Gallery</a>
            <a href="#" className="hover:text-white transition-colors">Showcase</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase tracking-wider">Infinity Access</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-white/20"></div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar Controls */}
        <aside className="w-80 border-r border-white/10 backdrop-blur-2xl bg-black/20 p-6 flex flex-col gap-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Model Style</label>
            <div className="relative group">
              <select 
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none hover:bg-white/10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              >
                {ART_STYLES.map(style => (
                  <option key={style.id} value={style.id} className="bg-aura-black text-white">{style.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`aspect-square border rounded-lg flex items-center justify-center transition-all ${
                    aspectRatio === ratio.id 
                    ? 'border-purple-500/60 bg-purple-500/10' 
                    : 'border-white/10 hover:bg-white/5'
                  }`}
                  title={ratio.label}
                >
                  <div className={`border border-white/60 ${
                    ratio.id === '1:1' ? 'w-4 h-4' : 
                    ratio.id === '16:9' ? 'w-6 h-3.5' : 
                    ratio.id === '9:16' ? 'w-3.5 h-6' : 
                    ratio.id === '4:3' ? 'w-5 h-4' : 
                    'w-4 h-5'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
             <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Tips</label>
             <p className="text-[11px] text-slate-500 leading-relaxed italic">
               Use the enhance button to let AI refine your creative seeds into detailed masterpiece prompts.
             </p>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> AI Enhanced</span>
              <div 
                onClick={handleEnhance}
                className={`w-8 h-4 rounded-full relative px-1 flex items-center cursor-pointer transition-colors ${
                  isEnhancing ? 'bg-purple-600 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className={`w-2.5 h-2.5 bg-white rounded-full ${isEnhancing ? 'animate-pulse' : ''}`}></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <section className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          {/* Active Creation / Gallery Toggle Area */}
          <div className="flex-1 min-h-[400px] flex flex-col gap-8">
            {isGenerating || gallery.length === 0 ? (
              <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden relative group shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                <div className="text-center opacity-40">
                  <div className={`w-16 h-16 border-4 border-dashed border-white/40 rounded-full mx-auto mb-4 ${isGenerating ? 'animate-spin-slow' : ''}`} />
                  <p className="text-sm tracking-widest uppercase font-bold">
                    {isGenerating ? 'Rendering Masterpiece...' : 'Ready for Creation'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                <AnimatePresence mode="popLayout">
                  {gallery.map((img) => (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setExpandedImage(img)}
                      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white/5 border border-white/10 transition-all hover:border-purple-500/30"
                    >
                      <img 
                        src={img.url} 
                        alt={img.prompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-xs line-clamp-2 pr-8 opacity-80 font-light leading-relaxed italic">
                            "{img.prompt}"
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => removeImage(img.id, e)}
                              className="p-2 bg-white/10 hover:bg-red-500/80 rounded-full transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="p-2 bg-white/10 rounded-full">
                              <Maximize2 className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative mt-auto">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 pr-40 text-sm focus:outline-none focus:border-purple-500/50 resize-none backdrop-blur-xl shadow-inner transition-colors font-medium placeholder:text-slate-600"
              placeholder="Describe what you want to see..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <div className="absolute right-2 top-2 bottom-2 flex items-stretch gap-2">
              <button 
                onClick={handleEnhance}
                disabled={isEnhancing || !prompt.trim()}
                className="px-4 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all disabled:opacity-30"
                title="Enhance Prompt"
              >
                <Sparkles className={`w-5 h-5 ${isEnhancing ? 'animate-pulse' : ''}`} />
              </button>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 flex items-center gap-2 rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Generate</span>
                    <Play className="w-4 h-4 fill-current" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            />
            
            <motion.div 
              layoutId={expandedImage.id}
              className="relative max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
            >
              <div className="lg:col-span-2 relative">
                <img 
                  src={expandedImage.url} 
                  alt={expandedImage.prompt}
                  className="w-full h-auto rounded-3xl shadow-3xl ring-1 ring-white/20"
                />
                <button 
                  onClick={() => setExpandedImage(null)}
                  className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-col gap-6 text-white h-full justify-center">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">Active Prompt</h3>
                  <p className="text-xl font-light leading-snug tracking-tight italic opacity-90">
                    "{expandedImage.prompt}"
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-2xl">
                    <span className="block text-[10px] uppercase tracking-wider opacity-40 mb-1">Aspect Ratio</span>
                    <span className="text-sm font-medium">{expandedImage.aspectRatio}</span>
                  </div>
                  <div className="glass p-4 rounded-2xl">
                    <span className="block text-[10px] uppercase tracking-wider opacity-40 mb-1">Created</span>
                    <span className="text-sm font-medium">{new Date(expandedImage.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <a 
                    href={expandedImage.url} 
                    download={`aura-art-${expandedImage.id}.png`}
                    className="w-full h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-semibold hover:bg-white/90 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download Art
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

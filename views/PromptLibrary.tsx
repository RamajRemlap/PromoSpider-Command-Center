import React, { useState } from 'react';
import { PROMPT_TEMPLATES } from '../data/promptTemplates';
import { PromptCategory, PromptTemplate } from '../types';
import { 
  BookOpen, 
  Copy, 
  Terminal, 
  CheckCircle, 
  Cpu, 
  Shield, 
  Edit3, 
  Search,
  Filter,
  Zap,
  LayoutTemplate
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const PromptLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'ALL'>('ALL');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate>(PROMPT_TEMPLATES[0]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const categories: (PromptCategory | 'ALL')[] = ['ALL', 'EXTRACTION', 'COMPLIANCE', 'PUBLISHING', 'VALIDATION'];

  const filteredPrompts = PROMPT_TEMPLATES.filter(
    p => selectedCategory === 'ALL' || p.category === selectedCategory
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const highlightVariables = (text: string) => {
    // Regex to find {{VAR}}
    const parts = text.split(/(\{\{[A-Z_]+\}\})/g);
    return parts.map((part, i) => {
      if (part.match(/^\{\{[A-Z_]+\}\}$/)) {
        return <span key={i} className="text-amber-400 font-bold bg-amber-900/30 px-1 rounded-sm">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2 font-rajdhani uppercase">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Prompt DB
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 lg:pb-20">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className={`w-full text-left p-4 border transition-all cursor-pointer group ${
                selectedPrompt.id === prompt.id 
                  ? 'bg-indigo-900/20 border-indigo-500 shadow-[inset_3px_0_0_indigo]' 
                  : 'bg-[#0b1120] border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-sm uppercase font-rajdhani ${selectedPrompt.id === prompt.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {prompt.title}
                </h3>
                <Badge variant="neutral">{prompt.category.substring(0,3)}</Badge>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 font-mono leading-tight">{prompt.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Prompt Viewer */}
      <Card className="flex-1 flex flex-col h-full border-slate-700 bg-slate-900/20" noPadding>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-950/50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h2 className="text-2xl font-bold text-white font-rajdhani uppercase">{selectedPrompt.title}</h2>
               <span className="text-[10px] font-mono text-slate-500">ID: {selectedPrompt.id}</span>
            </div>
            <p className="text-slate-400 text-xs font-mono flex items-center gap-2">
              <Cpu className="w-3 h-3 text-indigo-400" /> TARGET_AGENT: <span className="text-indigo-300 font-bold uppercase">{selectedPrompt.agentRole}</span>
            </p>
          </div>
          <Button 
            variant="tech"
            size="sm"
            onClick={() => handleCopy(selectedPrompt.template, 'main')}
          >
            {copySuccess === 'main' ? 'COPIED' : 'COPY TEMPLATE'}
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Template */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4" /> System Instruction
                </h4>
                <div className="bg-black p-6 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed relative group shadow-inner">
                  {highlightVariables(selectedPrompt.template)}
                </div>
              </div>

              {/* Examples */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Few-Shot Data
                </h4>
                <div className="space-y-4">
                  {selectedPrompt.examples.map((ex, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 overflow-hidden">
                       <div className="bg-slate-950 px-3 py-1 border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase flex justify-between">
                         <span>Shot #{i + 1}</span>
                       </div>
                       <div className="p-3 grid grid-cols-1 gap-4">
                         <div>
                           <span className="text-[9px] text-blue-400 font-bold block mb-1">INPUT</span>
                           <p className="text-[10px] text-slate-400 font-mono bg-black p-2 border border-slate-800">{ex.input}</p>
                         </div>
                         <div>
                           <span className="text-[9px] text-emerald-400 font-bold block mb-1">OUTPUT</span>
                           <p className="text-[10px] text-slate-400 font-mono bg-black p-2 border border-slate-800 whitespace-pre-wrap">{ex.output}</p>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Metadata */}
            <div className="space-y-6">
              
              <div className="bg-slate-950 p-4 border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Injection Vars</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.inputVariables.map(v => (
                    <span key={v} className="px-2 py-1 bg-amber-900/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Self-Correction</h4>
                <ul className="space-y-2">
                  {selectedPrompt.selfCheckSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-slate-300 font-mono">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Format</h4>
                <div className="px-2 py-1 bg-purple-900/20 border border-purple-500/30 text-purple-400 text-[10px] font-mono inline-block">
                  {selectedPrompt.outputFormat}
                </div>
              </div>

            </div>

          </div>
        </div>
      </Card>
    </div>
  );
};

export default PromptLibrary;
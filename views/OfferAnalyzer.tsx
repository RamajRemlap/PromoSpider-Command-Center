
import React, { useState, useEffect } from 'react';
import { analyzeOfferText, generatePublicationCopy } from '../services/geminiService';
import { ParsedOfferData, FallbackAIConfig } from '../types';
import { speak, stopSpeaking } from '../services/voiceService';
import { 
  BrainCircuit, 
  Loader2, 
  CheckCircle, 
  AlertOctagon, 
  Copy, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Microscope, 
  Scan, 
  Volume2, 
  Square,
  Radio,
  ClipboardCheck,
  FileText,
  Activity,
  Target
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import NeuralNode from '../components/ui/NeuralNode';

interface OfferAnalyzerProps {
  initialText?: string;
  fallbackConfig: FallbackAIConfig;
}

const OfferAnalyzer: React.FC<OfferAnalyzerProps> = ({ initialText, fallbackConfig }) => {
  const [inputText, setInputText] = useState(initialText || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParsedOfferData | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  /**
   * Generates a high-confidence sentient report based on autonomous revenue logic.
   */
  const getNarrationText = (data: ParsedOfferData) => {
    const riskLevel = data.compliance_risk_score > 7 ? 'CRITICAL' : data.compliance_risk_score > 4 ? 'ELEVATED' : 'NOMINAL';
    const safetyProtocol = data.is_scam_suspicion ? 'INITIATING QUARANTINE: Fraud heuristics detected.' : 'CLEARANCE GRANTED: Signal validated against revenue patterns.';
    
    return `PROMOSPIDER INTEL REPORT: Neural extraction for ${data.merchant} is complete. Objective result identifies as ${data.title}. Payout vector structured at ${data.payout_terms}. Compliance assessment indicates a ${riskLevel} risk posture with a composite score of ${data.compliance_risk_score} out of 10. ${safetyProtocol} Outcome logged to sentient memory for yield optimization.`.trim();
  };

  const handleAnalyze = async () => {
    if (!inputText) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setGeneratedCopy(null);
    stopSpeaking();

    try {
      const data = await analyzeOfferText(inputText, fallbackConfig);
      setResult(data);
      
      if (autoNarrate) {
        triggerNarration(data);
      }
    } catch (err: any) {
      setError(err.message || "Analysis failed. System credentials may be missing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCopy = async () => {
    if (!result) return;
    setIsLoading(true);
    try {
      const copy = await generatePublicationCopy(result, fallbackConfig);
      setGeneratedCopy(copy);
    } catch (err: any) {
      setError(err.message || "Copy generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerNarration = (data: ParsedOfferData) => {
    const text = getNarrationText(data);
    setIsSpeaking(true);
    speak(text);
    
    // Auto-reset speaking state after average duration (approx 20s for this long sentient report)
    setTimeout(() => setIsSpeaking(false), 20000);
  };

  const handleSpeakReport = () => {
    if (!result) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    triggerNarration(result);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = getNarrationText(result);
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Input & Extraction Section */}
      <div className="flex flex-col space-y-6 overflow-y-auto scrollbar-thin pr-1">
        <Card className="border-indigo-500/30 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 font-rajdhani uppercase tracking-widest">
              <Zap className="w-4 h-4 text-amber-500" /> Orchestration Terminal
            </h3>
            <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">AUTO_NARRATE</span>
                  <div 
                    onClick={() => setAutoNarrate(!autoNarrate)}
                    className={`w-8 h-4 rounded-full border transition-all relative ${autoNarrate ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-slate-900 border-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${autoNarrate ? 'left-4.5' : 'left-0.5'}`}></div>
                  </div>
               </label>
               <Badge variant="success">GEMINI_3_PRO</Badge>
            </div>
          </div>
          <div className="space-y-4">
             <p className="text-[10px] text-slate-500 font-mono leading-tight uppercase">
                ANALYSIS LOGIC: Sentient extraction mode. Comparing signal against historical revenue vectors and fraud heuristics.
             </p>
          </div>
        </Card>

        <Card className="flex-shrink-0 flex flex-col border-slate-700 bg-slate-900/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 font-rajdhani tracking-widest">
              <Scan className="w-4 h-4 text-blue-500" /> RAW_SIGNAL_INGEST
            </h3>
            <span className="text-[10px] text-slate-600 font-mono tracking-tighter">{inputText.length.toLocaleString()} BYTES</span>
          </div>
          <textarea 
            className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-none p-4 text-indigo-100 text-sm font-mono focus:border-indigo-500 focus:bg-black outline-none resize-none scrollbar-thin transition-all placeholder:text-slate-700 shadow-inner"
            placeholder="PASTE RAW_DOM_CONTENT OR UNSTRUCTURED_OFFER_TEXT..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <Button 
              variant="tech"
              onClick={handleAnalyze}
              disabled={isLoading || !inputText}
              className="w-full md:w-auto font-rajdhani tracking-widest"
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Microscope className="w-4 h-4" />}
              {isLoading ? "VECTOR_PROCESSING..." : "ENGAGE_ANALYSIS"}
            </Button>
          </div>
        </Card>

        {/* STRUCTURED EXTRACTION DISPLAY (Directly below textarea) */}
        {result && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="px-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-rajdhani uppercase tracking-widest">Signal_Extraction_Summary</span>
              </div>
              <Badge variant={result.is_scam_suspicion ? 'danger' : 'success'} className="animate-pulse">
                {result.is_scam_suspicion ? 'QUARANTINE_RECO' : 'SENTIENCE_VALIDATED'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Title Identity */}
              <div className="md:col-span-2 bg-[#050914] border border-slate-800 p-4 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20 group-hover:bg-cyan-500/50 transition-all"></div>
                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest block mb-1">Entity_Title</span>
                <h4 className="text-lg font-bold text-white font-rajdhani tracking-wide truncate">{result.title}</h4>
                <div className="mt-2 flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase">{result.merchant}</span>
                </div>
              </div>

              {/* Risk Vector Display */}
              <div className="bg-[#050914] border border-slate-800 p-4 relative group overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full transition-all ${
                  result.compliance_risk_score > 7 ? 'bg-rose-500' : 
                  result.compliance_risk_score > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>
                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest block mb-1">Risk_Posture</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-mono font-bold ${
                    result.compliance_risk_score > 7 ? 'text-rose-500' : 
                    result.compliance_risk_score > 4 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>{result.compliance_risk_score}</span>
                  <span className="text-slate-600 font-mono text-[10px]">/ 10</span>
                </div>
                <div className="mt-2 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.compliance_risk_score > 7 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 
                      result.compliance_risk_score > 4 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    }`}
                    style={{ width: `${result.compliance_risk_score * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions for Results */}
            <div className="flex gap-2">
              <button 
                onClick={handleCopyReport}
                className={`flex-1 text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-all py-2 rounded-sm border border-slate-800 bg-slate-900/50 hover:text-white hover:border-slate-600 ${copiedReport ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400'}`}
              >
                {copiedReport ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedReport ? 'REPORT_SECURED' : 'COPY_INTEL_REPORT'}
              </button>
              <button 
                onClick={handleSpeakReport} 
                className={`flex-1 text-[10px] uppercase font-bold flex items-center justify-center gap-2 transition-all py-2 rounded-sm border ${
                  isSpeaking 
                    ? 'text-rose-400 border-rose-500/50 bg-rose-950/20 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.2)]' 
                    : 'text-slate-400 border-slate-800 bg-slate-900/50 hover:text-white hover:border-slate-600'
                }`}
              >
                {isSpeaking ? <Square className="w-2.5 h-2.5 fill-current" /> : <Volume2 className="w-3 h-3" />}
                {isSpeaking ? 'ABORT_AUDIO' : 'PLAY_SYSTEM_REPORT'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deep Intelligence & Synthesis Section (Right Column) */}
      <div className="flex flex-col space-y-6 overflow-y-auto scrollbar-thin pr-1">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-none flex items-start gap-3 animate-in slide-in-from-right relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
             <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
             <div>
               <h4 className="text-xs font-bold uppercase font-rajdhani mb-1">SYSTEM_CRITICAL: EXTRACTION_FAILURE</h4>
               <span className="text-[11px] font-mono leading-tight">{error}</span>
             </div>
          </div>
        )}

        {!result && !isLoading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 border border-dashed border-slate-800 rounded-none bg-slate-950/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]"></div>
            <BrainCircuit className="w-24 h-24 mb-6 opacity-10 animate-pulse z-0" />
            <p className="font-rajdhani font-bold text-lg uppercase tracking-[0.2em] relative z-10 text-glow">AWAITING_COGNITION</p>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-[ping_3s_linear_infinite]"></div>
                <div className="relative w-16 h-16">
                   <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-full border-t-indigo-400 animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
                   </div>
                </div>
             </div>
             <div className="text-center space-y-3">
               <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-[0.3em] animate-pulse">Neural Mapping</h3>
               <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Identifying revenue vectors and risk heuristics...</p>
             </div>
          </div>
        )}

        {result && (
          <Card className={`animate-in slide-in-from-right duration-500 border-l-4 ${
            result.compliance_risk_score > 7 ? 'border-rose-500 bg-rose-950/5' : 
            result.compliance_risk_score > 4 ? 'border-amber-500 bg-amber-950/5' : 
            'border-emerald-500 bg-emerald-950/5'
          }`}>
            <div className="flex justify-between items-start mb-6 border-b border-slate-800/50 pb-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-400 font-rajdhani uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Deep_Cognition_Layer
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="neutral" className="tracking-tighter font-mono">{result._ai_model_used || 'SYSTEM_CORE'}</Badge>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">VEC_ID: {Math.random().toString(16).substring(2, 10)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/40 p-4 border border-slate-800/80 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/10 group-hover:bg-emerald-500/30 transition-all"></div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] font-mono">Payout Vector</span>
                <p className="text-emerald-400 font-mono font-bold text-lg mt-1 tracking-tight truncate">{result.payout_terms}</p>
              </div>
              <div className="bg-black/40 p-4 border border-slate-800/80 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/10 group-hover:bg-indigo-500/30 transition-all"></div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] font-mono">Temporal Limit</span>
                <p className="text-slate-300 font-mono font-bold text-lg mt-1 tracking-tight truncate">{result.expiration_date || 'N/A'}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 font-mono tracking-widest">
                <CheckCircle className="w-3 h-3 text-indigo-500" /> Redemption Protocol
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {result.redemption_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-black/30 border border-slate-800/50 hover:bg-slate-900/40 transition-colors">
                    <span className="font-mono text-[10px] text-indigo-500 font-bold mt-0.5">[{idx + 1}]</span>
                    <span className="text-xs text-slate-400 uppercase leading-relaxed font-mono">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-950/5 border border-indigo-500/20 mb-6">
               <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 font-mono">Compliance_Logic_Notes</h4>
               <p className="text-xs text-slate-500 leading-relaxed italic">"{result.compliance_notes}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
              <Button variant="outline" onClick={handleGenerateCopy} className="text-[10px] tracking-[0.2em]">
                <Cpu className="w-3 h-3" /> SYNTHESIZE_COPY
              </Button>
              <Button variant="tech" className="text-[10px] tracking-[0.2em]">
                <CheckCircle className="w-3 h-3" /> APPROVE_VECTOR
              </Button>
            </div>
          </Card>
        )}

        {generatedCopy && (
           <Card className="animate-in slide-in-from-bottom duration-500 border-indigo-500/20 bg-indigo-950/5 relative">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-white uppercase flex items-center gap-2 font-mono tracking-widest">
                  <BrainCircuit className="w-3 h-3 text-indigo-400" /> Synthetic_Content
                </h4>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(generatedCopy)} className="text-[9px]">
                  <Copy className="w-3 h-3" /> CLIP_DRAFT
                </Button>
             </div>
             <div className="bg-black/60 p-4 border border-slate-800 font-mono text-[11px] text-indigo-100/70 whitespace-pre-wrap leading-relaxed shadow-inner">
               {generatedCopy}
             </div>
           </Card>
        )}
      </div>
    </div>
  );
};

export default OfferAnalyzer;

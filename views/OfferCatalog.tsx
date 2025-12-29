
import React, { useState, useEffect } from 'react';
import { ParsedOfferData } from '../types';
import { generateCanonicalHash, checkDuplicate } from '../services/deduplicationService';
import { Search, Split, Check, RefreshCw, Edit2, Save, AlertTriangle, ExternalLink, Copy, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Microscope } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

// Expanded Mock Data for Pagination Demo
const MOCK_OFFERS_BASE: ParsedOfferData[] = [
  {
    title: "Chase Sapphire Preferred - 60,000 Bonus Points",
    merchant: "Chase Bank",
    payout_terms: "60,000 Points ($750 value)",
    expiration_date: "2024-12-31",
    redemption_steps: ["Spend $4000 in 3 months"],
    compliance_risk_score: 2,
    compliance_notes: "Credit check required.",
    is_scam_suspicion: false,
    network_source: "CRAWL",
    raw_id: "crawl-112"
  },
  {
    title: "Chase Sapphire Preferred® Card - Earn 60k Pts",
    merchant: "Chase",
    payout_terms: "60000 pts",
    expiration_date: null,
    redemption_steps: ["Apply now"],
    compliance_risk_score: 2,
    compliance_notes: "Duplicate likelihood high.",
    is_scam_suspicion: false,
    network_source: "IMPACT",
    raw_id: "imp-998"
  },
  {
    title: "NordVPN 63% Off + 3 Months Free",
    merchant: "NordVPN",
    payout_terms: "63% Off",
    expiration_date: "2024-11-01",
    redemption_steps: ["2-year plan purchase"],
    compliance_risk_score: 1,
    compliance_notes: "Safe.",
    is_scam_suspicion: false,
    network_source: "CJ",
    raw_id: "cj-221"
  },
  {
    title: "Bluehost - Web Hosting $2.95/mo",
    merchant: "Bluehost",
    payout_terms: "$65 CPA",
    expiration_date: null,
    redemption_steps: ["New customer signup", "12mo term"],
    compliance_risk_score: 1,
    compliance_notes: "Standard hosting offer",
    is_scam_suspicion: false,
    network_source: "IMPACT",
    raw_id: "imp-blue-01"
  },
  {
    title: "Capital One Venture X - 75,000 Miles",
    merchant: "Capital One",
    payout_terms: "75k Miles",
    expiration_date: "2025-01-01",
    redemption_steps: ["Spend $4k in 3mo"],
    compliance_risk_score: 3,
    compliance_notes: "High payout, strict approval",
    is_scam_suspicion: false,
    network_source: "CRAWL",
    raw_id: "crawl-cap-01"
  },
  {
    title: "HelloFresh - 16 Free Meals",
    merchant: "HelloFresh",
    payout_terms: "$20 CPA",
    expiration_date: "2024-10-30",
    redemption_steps: ["First box order"],
    compliance_risk_score: 1,
    compliance_notes: "Subscription model",
    is_scam_suspicion: false,
    network_source: "CJ",
    raw_id: "cj-hello-01"
  },
  {
    title: "SoFi Checking - $250 Bonus",
    merchant: "SoFi",
    payout_terms: "$250 Cash",
    expiration_date: "2024-12-31",
    redemption_steps: ["Direct deposit required"],
    compliance_risk_score: 2,
    compliance_notes: "Banking regulations apply",
    is_scam_suspicion: false,
    network_source: "IMPACT",
    raw_id: "imp-sofi-01"
  },
  {
    title: "ExpressVPN - 30 Days Free",
    merchant: "ExpressVPN",
    payout_terms: "$40 CPA",
    expiration_date: null,
    redemption_steps: ["Sign up", "Active for 30 days"],
    compliance_risk_score: 1,
    compliance_notes: "Clean offer",
    is_scam_suspicion: false,
    network_source: "CJ",
    raw_id: "cj-express-01"
  }
];

// Generate more items for pagination demo
const MOCK_OFFERS: ParsedOfferData[] = [
  ...MOCK_OFFERS_BASE,
  ...Array.from({ length: 24 }).map((_, i) => ({
    title: `Generic Promo Offer #${i + 100}`,
    merchant: `Merchant ${String.fromCharCode(65 + (i % 26))}`,
    payout_terms: `$${(i * 5) + 10} Bonus`,
    expiration_date: "2025-06-01",
    redemption_steps: ["Sign up", "Verify email"],
    compliance_risk_score: Math.floor(Math.random() * 4),
    compliance_notes: "Auto-generated mock",
    is_scam_suspicion: false,
    network_source: i % 2 === 0 ? "CRAWL" : "IMPACT",
    raw_id: `mock-${i}`
  }))
];

const DEFAULT_INCOMING: ParsedOfferData = {
  title: "Chase Sapphire Preferred - 60K Bonus",
  merchant: "Chase", 
  payout_terms: "60,000 pts",
  expiration_date: "2024-12-31",
  redemption_steps: [],
  compliance_risk_score: 0,
  compliance_notes: "",
  is_scam_suspicion: false,
  network_source: "NEW_CRAWL",
  raw_id: "new-1"
};

const ITEMS_PER_PAGE = 6;

interface OfferCatalogProps {
  onAnalyze?: (text: string) => void;
}

const OfferCatalog: React.FC<OfferCatalogProps> = ({ onAnalyze }) => {
  const [offers, setOffers] = useState<(ParsedOfferData & { hash?: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDedupeSim, setShowDedupeSim] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<ParsedOfferData>(DEFAULT_INCOMING);
  const [isEditingIncoming, setIsEditingIncoming] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const processOffers = async () => {
      const processed = await Promise.all(MOCK_OFFERS.map(async (offer) => ({
        ...offer,
        hash: await generateCanonicalHash(offer)
      })));
      setOffers(processed);
    };
    processOffers();
  }, []);

  // Filter logic
  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.merchant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOffers = filteredOffers.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getDedupeResult = (incoming: ParsedOfferData, existing: ParsedOfferData) => {
    return checkDuplicate(incoming, existing, {
      titleSimilarityThreshold: 0.7,
      matchMerchantExactly: false,
      matchPayoutFuzzy: true
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const triggerAnalysis = (offer: ParsedOfferData) => {
    if (onAnalyze) {
      const text = `
Title: ${offer.title}
Merchant: ${offer.merchant}
Payout: ${offer.payout_terms}
Expiration: ${offer.expiration_date || 'N/A'}
Notes: ${offer.compliance_notes}
      `.trim();
      onAnalyze(text);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      
      {/* Simulation Panel */}
      {showDedupeSim && (
        <Card className="border-indigo-500/30 bg-indigo-950/10 animate-in slide-in-from-top duration-300">
          <div className="p-4 border-b border-indigo-500/20 flex justify-between items-center bg-indigo-900/10">
             <div className="flex items-center gap-2">
               <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin-slow" /> 
               <h3 className="text-sm font-bold text-indigo-100">Ingestion Simulator</h3>
             </div>
             <button onClick={() => setShowDedupeSim(false)} className="text-xs text-indigo-300 hover:text-white underline">Close</button>
          </div>

          <div className="p-4">
             <div className="flex justify-between items-center mb-3">
               <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">Incoming Payload</span>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => triggerAnalysis(incomingOffer)}
                   className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-2 py-1 bg-emerald-900/20 rounded border border-emerald-900/50"
                 >
                   <Microscope className="w-3 h-3" /> Neural Analyze
                 </button>
                 <button 
                   onClick={() => setIsEditingIncoming(!isEditingIncoming)} 
                   className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 bg-slate-900 rounded border border-slate-700"
                 >
                   {isEditingIncoming ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                   {isEditingIncoming ? "Done" : "Edit"}
                 </button>
               </div>
            </div>
            
            {isEditingIncoming ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  value={incomingOffer.title}
                  onChange={e => setIncomingOffer({...incomingOffer, title: e.target.value})}
                  placeholder="Title"
                />
                <input 
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  value={incomingOffer.merchant}
                  onChange={e => setIncomingOffer({...incomingOffer, merchant: e.target.value})}
                  placeholder="Merchant"
                />
                <input 
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  value={incomingOffer.payout_terms}
                  onChange={e => setIncomingOffer({...incomingOffer, payout_terms: e.target.value})}
                  placeholder="Payout"
                />
              </div>
            ) : (
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex flex-wrap gap-4 text-sm font-mono items-center">
                <span className="text-white font-bold">{incomingOffer.title}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">{incomingOffer.merchant}</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">{incomingOffer.payout_terms}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search offers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>
        
        <div className="flex items-center gap-4">
           <span className="text-xs text-slate-500 font-mono hidden md:block">
             Total: <span className="text-white">{filteredOffers.length}</span>
           </span>
           <Button 
             variant={showDedupeSim ? 'primary' : 'secondary'}
             onClick={() => setShowDedupeSim(!showDedupeSim)}
             className="flex items-center gap-2"
           >
             <Split className="w-4 h-4" />
             {showDedupeSim ? 'Hide Simulator' : 'Test Deduplication'}
           </Button>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 gap-4 min-h-[500px] content-start">
        {currentOffers.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-xl">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
               <Search className="w-8 h-8 text-slate-600" />
             </div>
             <p className="text-slate-500 font-mono text-sm">No offers found matching your criteria.</p>
           </div>
        ) : (
          currentOffers.map((offer, idx) => {
            const dedupe = showDedupeSim ? getDedupeResult(incomingOffer, offer) : null;
            
            return (
              <Card key={`${offer.raw_id}-${idx}`} className={`group transition-all duration-300 ${dedupe?.isDuplicate ? 'border-rose-500/30 bg-rose-900/5' : 'hover:border-slate-600'}`}>
                <div className="p-5 flex flex-col md:flex-row gap-6">
                  
                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={offer.network_source === 'IMPACT' ? 'success' : offer.network_source === 'CJ' ? 'info' : 'default'}>
                        {offer.network_source}
                      </Badge>
                      {offer.network_source === 'IMPACT' && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      <span className="text-xs text-slate-500 font-mono truncate" title={offer.hash}>
                        {offer.hash?.substring(0, 12)}...
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-indigo-300 transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-slate-400">{offer.merchant}</p>
                  </div>

                  {/* Payout & Risk */}
                  <div className="flex flex-col md:items-end gap-2 md:w-48 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Payout</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">{offer.payout_terms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Risk Score:</span>
                      <div className="flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-1 h-2 rounded-full ${i < offer.compliance_risk_score ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dedupe Result Panel (Conditional) */}
                  {dedupe && (
                    <div className="md:w-64 flex-shrink-0 bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex flex-col justify-center animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Match Score</span>
                        <Badge variant={dedupe.confidenceScore > 0.8 ? 'danger' : dedupe.confidenceScore > 0.5 ? 'warning' : 'success'}>
                          {(dedupe.confidenceScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      {dedupe.isDuplicate ? (
                        <div className="text-xs text-rose-400 font-bold flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3 h-3" /> Duplicate Detected
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 mb-1">
                          <Check className="w-3 h-3" /> No Conflict
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        {dedupe.reasons.length > 0 ? dedupe.reasons.slice(0, 2).map((r, i) => <div key={i}>• {r}</div>) : <div>• No similarity triggers</div>}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex md:flex-col justify-center gap-2 md:border-l border-slate-800 md:pl-6">
                    <button 
                      onClick={() => triggerAnalysis(offer)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" 
                      title="Analyze with AI"
                    >
                      <Microscope className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Copy ID">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {filteredOffers.length > 0 && (
        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
             Showing <span className="text-white font-bold">{startIndex + 1}-{Math.min(endIndex, filteredOffers.length)}</span> of <span className="text-white font-bold">{filteredOffers.length}</span> results
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => handlePageChange(1)} 
               disabled={currentPage === 1}
               className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronsLeft className="w-4 h-4" />
             </button>
             <button 
               onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
               disabled={currentPage === 1}
               className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronLeft className="w-4 h-4" />
             </button>
             
             <div className="px-4 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white">
               Page {currentPage} / {totalPages}
             </div>
             
             <button 
               onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
               disabled={currentPage === totalPages}
               className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronRight className="w-4 h-4" />
             </button>
             <button 
               onClick={() => handlePageChange(totalPages)} 
               disabled={currentPage === totalPages}
               className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronsRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCatalog;
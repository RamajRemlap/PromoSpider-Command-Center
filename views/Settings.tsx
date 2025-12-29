
import React, { useState } from 'react';
import { 
  Save, 
  Shield, 
  Key, 
  Network, 
  Globe, 
  Layers, 
  Calendar, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  Lock,
  Info,
  Server,
  Zap
} from 'lucide-react';
import { SystemConfig } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface SettingsProps {
  config: SystemConfig;
  setConfig: (config: SystemConfig) => void;
}

type Tab = 'GENERAL' | 'NETWORKS' | 'SCHEDULES' | 'DEDUPE';

const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [newProxy, setNewProxy] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    console.log('SYNCING_SYSTEM_STATE:', config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addProxy = () => {
    if (newProxy) {
      setConfig({ ...config, proxyPool: [...config.proxyPool, newProxy] });
      setNewProxy('');
    }
  };

  const removeProxy = (index: number) => {
    const newPool = [...config.proxyPool];
    newPool.splice(index, 1);
    setConfig({ ...config, proxyPool: newPool });
  };

  const toggleSchedule = (id: string) => {
    setConfig({
      ...config,
      harvestSchedules: config.harvestSchedules.map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    });
  };

  const InputField = ({ label, value, onChange, type = "text", placeholder = "", description = "" }: any) => (
    <div className="mb-5 group">
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{label}</label>
        {description && (
          <div className="text-[9px] text-slate-600 italic uppercase flex items-center gap-1">
             <Info className="w-2.5 h-2.5" /> {description}
          </div>
        )}
      </div>
      <input 
        type={type} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-black/60 border border-slate-800 p-2.5 text-xs text-white focus:border-indigo-500 outline-none font-mono transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:border-slate-700 placeholder:text-slate-800"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <div className="flex-shrink-0 flex justify-between items-end">
        <div className="flex gap-1 bg-slate-900/50 p-1 border border-slate-800 rounded-sm">
          <Button variant={activeTab === 'GENERAL' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('GENERAL')}>General</Button>
          <Button variant={activeTab === 'NETWORKS' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('NETWORKS')}>Networks</Button>
          <Button variant={activeTab === 'SCHEDULES' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('SCHEDULES')}>Schedules</Button>
          <Button variant={activeTab === 'DEDUPE' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('DEDUPE')}>Dedupe</Button>
        </div>
        
        <Button 
          variant="tech" 
          onClick={handleSave}
          className={`transition-all duration-300 font-rajdhani tracking-widest ${isSaved ? "border-emerald-500 text-emerald-400 bg-emerald-950/20" : ""}`}
        >
          {isSaved ? <span className="flex items-center gap-2"><Lock className="w-3 h-3" /> SECURED</span> : <><Save className="w-4 h-4" /> COMMIT CHANGES</>}
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20 pr-1">
        
        {/* GENERAL TAB */}
        {activeTab === 'GENERAL' && (
          <div className="space-y-6 max-w-4xl">
            
            <Card className="border-indigo-500/10">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-rajdhani uppercase tracking-widest">
                <Key className="w-5 h-5 text-amber-500" /> PRIMARY_INTELLIGENCE
              </h3>
              <div className="p-4 bg-slate-950/50 border border-slate-800 border-l-2 border-l-indigo-500 flex items-start gap-4">
                 <Lock className="w-5 h-5 text-indigo-400 mt-1" />
                 <div>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase font-mono">Managed Identity</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 leading-relaxed uppercase">
                       Gemini Pro/Flash credentials are automatically sourced from the secure execution vault (process.env). 
                       Direct UI access is disabled to prevent leakage.
                    </p>
                 </div>
              </div>
            </Card>

            <Card className="border-purple-500/10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-500" />
                  <h3 className="text-sm font-bold text-white font-rajdhani uppercase tracking-widest">FALLBACK_COGNITION</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer group">
                  <span className="mr-3 text-[9px] font-mono font-bold text-slate-600 group-hover:text-purple-400 transition-colors uppercase">FAILOVER_ACTIVE</span>
                  <div 
                    onClick={() => setConfig({...config, fallbackAi: {...config.fallbackAi, enabled: !config.fallbackAi.enabled}})}
                    className={`w-10 h-5 border transition-all relative ${config.fallbackAi.enabled ? 'bg-purple-900/30 border-purple-500' : 'bg-slate-900 border-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white transition-all ${config.fallbackAi.enabled ? 'left-6' : 'left-0.5'}`}></div>
                  </div>
                </label>
              </div>
              
              <div className={`space-y-4 transition-all duration-500 ${config.fallbackAi.enabled ? 'opacity-100 scale-100' : 'opacity-20 pointer-events-none scale-95'}`}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      label="Provider Profile" 
                      value={config.fallbackAi.providerName} 
                      onChange={(e: any) => setConfig({...config, fallbackAi: {...config.fallbackAi, providerName: e.target.value}})} 
                      description="e.g. Groq, Ollama, vLLM"
                    />
                    <InputField 
                      label="Model Identity" 
                      value={config.fallbackAi.modelName} 
                      onChange={(e: any) => setConfig({...config, fallbackAi: {...config.fallbackAi, modelName: e.target.value}})} 
                      description="e.g. llama-3-70b"
                    />
                 </div>
                 <InputField 
                    label="Endpoint Vector" 
                    value={config.fallbackAi.baseUrl} 
                    onChange={(e: any) => setConfig({...config, fallbackAi: {...config.fallbackAi, baseUrl: e.target.value}})} 
                    placeholder="https://api.provider.com/v1"
                 />
                 <InputField 
                    label="Secure Token" 
                    type="password" 
                    value={config.fallbackAi.apiKey} 
                    onChange={(e: any) => setConfig({...config, fallbackAi: {...config.fallbackAi, apiKey: e.target.value}})} 
                    placeholder="AUT_PK_..."
                 />
              </div>
            </Card>

            <Card className="border-blue-500/10">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-rajdhani uppercase tracking-widest">
                <Network className="w-5 h-5 text-blue-500" /> MESH_PROXY_NODES
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newProxy}
                    onChange={(e) => setNewProxy(e.target.value)}
                    placeholder="STRAT_ADDR: http://user:pass@host:port"
                    className="flex-1 bg-black border border-slate-800 p-2.5 text-[11px] text-white focus:border-blue-500 outline-none font-mono placeholder:text-slate-800"
                  />
                  <Button variant="outline" onClick={addProxy} size="sm" className="font-mono text-[10px]">INJECT</Button>
                </div>
                <div className="bg-black/50 border border-slate-800 p-2 max-h-40 overflow-y-auto space-y-1 scrollbar-thin">
                  {config.proxyPool.map((proxy, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] text-slate-500 font-mono bg-slate-950/80 p-2 border-b border-slate-900 last:border-0 group">
                      <span className="truncate flex-1 group-hover:text-blue-400 transition-colors">{proxy}</span>
                      <button onClick={() => removeProxy(idx)} className="text-rose-900 hover:text-rose-500 ml-2 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* NETWORKS TAB */}
        {activeTab === 'NETWORKS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            {config.affiliateNetworks.map((network) => (
              <Card key={network.id} className="group border-indigo-500/5 hover:border-indigo-500/30 bg-slate-900/10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                       <Server className="w-5 h-5 text-indigo-400" />
                       <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-rajdhani uppercase tracking-widest">{network.name}</h4>
                      <p className="text-[9px] text-slate-500 font-mono uppercase">Node ID: {network.id}</p>
                    </div>
                  </div>
                  <Badge variant={network.status === 'ACTIVE' ? 'success' : 'neutral'}>{network.status}</Badge>
                </div>
                <InputField label="PUB_ID_V4" value={network.publisherId} description="Unique API identifier" />
                <Button variant="outline" size="sm" className="w-full font-mono text-[10px] tracking-widest mt-2 hover:bg-indigo-950/30">
                  <RefreshCw className="w-3 h-3" /> TRIGGER_FORCE_SYNC
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* SCHEDULES TAB */}
        {activeTab === 'SCHEDULES' && (
          <Card className="max-w-4xl border-indigo-500/10">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-rajdhani uppercase tracking-widest border-b border-slate-800 pb-4">
                <Calendar className="w-5 h-5 text-indigo-500" /> HARVEST_CYCLE_VECTORS
            </h3>
            <div className="space-y-4">
              {config.harvestSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-4 bg-slate-950/80 p-4 border border-slate-800 hover:border-slate-700 transition-all group">
                  <div className={`p-3 bg-slate-900 border border-slate-800 ${schedule.enabled ? 'text-emerald-400' : 'text-slate-700'}`}>
                    <RefreshCw className={`w-5 h-5 ${schedule.enabled ? 'animate-spin-slow' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-xs uppercase font-rajdhani tracking-widest">{schedule.target.replace('_', ' ')}</span>
                      {schedule.enabled ? <Badge variant="success">SYNC_ENGAGED</Badge> : <Badge variant="neutral">STANDBY</Badge>}
                    </div>
                    <div className="flex gap-4 text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                      <span>Cron: <span className="text-indigo-400 font-bold">{schedule.cronExpression}</span></span>
                      <span>Jitter: <span className="text-amber-500 font-bold">±{schedule.jitterMinutes}m</span></span>
                    </div>
                  </div>
                  <Button size="sm" variant={schedule.enabled ? 'outline' : 'primary'} onClick={() => toggleSchedule(schedule.id)} className="text-[9px] tracking-widest">
                    {schedule.enabled ? 'DISENGAGE' : 'ENGAGE'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* DEDUPE TAB */}
        {activeTab === 'DEDUPE' && (
          <Card className="max-w-3xl border-purple-500/10">
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-rajdhani uppercase tracking-widest">
              <Layers className="w-5 h-5 text-purple-500" /> COLLISION_DETECTION_PROTOCOLS
            </h3>
            <div className="space-y-10 px-2">
              <div>
                <div className="flex justify-between mb-3 items-baseline">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">SIMILARITY_THRESHOLD_V2</label>
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/30 px-2 py-0.5 border border-purple-500/30">{Math.round(config.deduplication.titleSimilarityThreshold * 100)}% Match</span>
                </div>
                <div className="relative flex items-center h-4">
                  <div className="absolute inset-0 h-1 bg-slate-800 top-1.5 rounded-full"></div>
                  <input 
                    type="range" min="0.5" max="1.0" step="0.05"
                    value={config.deduplication.titleSimilarityThreshold}
                    onChange={(e) => setConfig({...config, deduplication: {...config.deduplication, titleSimilarityThreshold: parseFloat(e.target.value)}})}
                    className="w-full bg-transparent appearance-none cursor-pointer accent-purple-500 z-10"
                  />
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-mono uppercase tracking-widest">
                   <span>LOOSE_VEC</span>
                   <span>STRICT_VEC</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setConfig({...config, deduplication: {...config.deduplication, matchMerchantExactly: !config.deduplication.matchMerchantExactly}})}
                  className="flex items-start gap-4 p-4 bg-slate-950/80 border border-slate-800 hover:border-purple-500/20 transition-all cursor-pointer group"
                >
                  <div className={`mt-1 w-4 h-4 border-2 transition-all ${config.deduplication.matchMerchantExactly ? 'bg-purple-600 border-purple-400' : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'}`}></div>
                  <div>
                    <label className="block text-xs font-bold text-white uppercase font-rajdhani tracking-widest">STRICT_MERCH_REQUIRED</label>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase leading-relaxed">Blocks cross-merchant collisions even with high title similarity.</p>
                  </div>
                </div>
                
                <div 
                  onClick={() => setConfig({...config, deduplication: {...config.deduplication, matchPayoutFuzzy: !config.deduplication.matchPayoutFuzzy}})}
                  className="flex items-start gap-4 p-4 bg-slate-950/80 border border-slate-800 hover:border-purple-500/20 transition-all cursor-pointer group"
                >
                  <div className={`mt-1 w-4 h-4 border-2 transition-all ${config.deduplication.matchPayoutFuzzy ? 'bg-purple-600 border-purple-400' : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'}`}></div>
                  <div>
                    <label className="block text-xs font-bold text-white uppercase font-rajdhani tracking-widest">FUZZY_PAYOUT_LOGIC</label>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase leading-relaxed">Normalizes currency strings (e.g. '$50' == '$50.00') for comparison.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

export default Settings;

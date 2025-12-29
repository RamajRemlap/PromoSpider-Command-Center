
import React, { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import { voiceService } from './services/voiceRecognitionService';
import { speak } from './services/voiceService';
import { VoiceCommand, VoiceCommandType, SystemConfig, AffiliateNetwork, HarvestSchedule } from './types';
import VoiceHud from './components/ui/VoiceHud';

// View Imports
import Dashboard from './views/Dashboard';
import OfferAnalyzer from './views/OfferAnalyzer';
import SettingsView from './views/Settings';
import LiveFeed from './views/LiveFeed';
import OfferCatalog from './views/OfferCatalog';
import AgentOrchestration from './views/AgentOrchestration';
import ScraperArchitecture from './views/ScraperArchitecture';
import PromptLibrary from './views/PromptLibrary';
import AffiliateIntegrations from './views/AffiliateIntegrations';
import TrackingArchitecture from './views/TrackingArchitecture';
import PartnerPortal from './views/PartnerPortal';
import OperationsPlaybook from './views/OperationsPlaybook';
import DeploymentArchitecture from './views/DeploymentArchitecture';
import GrowthOptimization from './views/GrowthOptimization';
import EngineerExport from './views/EngineerExport';
import AutonomousControl from './views/AutonomousControl';
import SentientCortex from './views/SentientCortex';
import PipelineArchitecture from './views/PipelineArchitecture';

export enum View {
  DASHBOARD = 'DASHBOARD',
  ANALYZER = 'ANALYZER',
  OFFERS = 'OFFERS',
  LIVE_FEED = 'LIVE_FEED',
  AGENTS = 'AGENTS',
  SCRAPER = 'SCRAPER',
  PROMPTS = 'PROMPTS',
  INTEGRATIONS = 'INTEGRATIONS',
  TRACKING = 'TRACKING',
  PARTNERS = 'PARTNERS',
  SETTINGS = 'SETTINGS',
  PLAYBOOK = 'PLAYBOOK',
  DEPLOYMENT = 'DEPLOYMENT',
  GROWTH = 'GROWTH',
  EXPORT = 'EXPORT',
  AUTO_CONTROL = 'AUTO_CONTROL',
  SENTIENT = 'SENTIENT',
  PIPELINE = 'PIPELINE'
}

const INITIAL_CONFIG: SystemConfig = {
  geminiApiKey: '', // Managed by Environment
  fallbackAi: {
    enabled: false,
    providerName: 'Llama 3 (Groq)',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: '',
    modelName: 'llama3-70b-8192'
  },
  proxyPool: [
    'http://user:pass@us-west.proxy-provider.com:8000',
    'http://user:pass@eu-central.proxy-provider.com:8000'
  ],
  maxConcurrentScrapers: 12,
  dailyBudgetUsd: 5.00,
  complianceStrictness: 'HIGH',
  blockedDomains: ['scam-site.com', 'phishing-example.org'],
  affiliateNetworks: [
    { id: '1', name: 'Impact', apiKey: '', publisherId: 'PUB-101', status: 'ACTIVE', lastSync: '2023-10-27T10:00:00Z' },
    { id: '2', name: 'CJ', apiKey: '', publisherId: '33412', status: 'PAUSED', lastSync: '2023-10-26T14:30:00Z' }
  ] as AffiliateNetwork[],
  harvestSchedules: [
    { id: 's1', target: 'API_SYNC', cronExpression: '0 */4 * * *', jitterMinutes: 10, enabled: true },
    { id: 's2', target: 'CRAWL_DISCOVERY', cronExpression: '0 2 * * *', jitterMinutes: 45, enabled: true }
  ] as HarvestSchedule[],
  deduplication: {
    titleSimilarityThreshold: 0.85,
    matchMerchantExactly: true,
    matchPayoutFuzzy: true
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [analysisPayload, setAnalysisPayload] = useState<string>('');
  
  // System Config State (Shared)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_CONFIG);

  // Voice & Autonomous State
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [isAutonomous, setIsAutonomous] = useState(false);

  useEffect(() => {
    // Initialize Voice Service Listeners
    voiceService.setOnStatusChange(setIsVoiceListening);
    voiceService.setOnCommand(handleVoiceCommand);
  }, []);

  // Autonomous Mode Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutonomous) {
      interval = setInterval(() => {
        if (Math.random() > 0.8) {
           speak("Autonomous cycle active. Optimizing harvest parameters.");
        }
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [isAutonomous]);

  const handleVoiceCommand = (cmd: VoiceCommand) => {
    setLastCommand(cmd);
    
    // Clear command toast after 3s
    setTimeout(() => setLastCommand(null), 3000);

    switch (cmd.type) {
      case 'NAVIGATE':
        if (cmd.payload) {
          setCurrentView(cmd.payload as View);
          speak(`Navigating to ${cmd.payload.toLowerCase().replace('_', ' ')}.`);
        }
        break;
      
      case 'ACTIVATE_AUTONOMOUS':
        setIsAutonomous(true);
        speak("Autonomous Mode Engaged. Swarm control transferred to Neural Core.");
        setCurrentView(View.SENTIENT); 
        break;

      case 'DEACTIVATE_AUTONOMOUS':
        setIsAutonomous(false);
        speak("Manual override accepted. Autonomous systems standby.");
        break;

      case 'SYSTEM_REPORT':
        speak("System is online. 9 Agents active. Revenue velocity is stable. No critical alerts.");
        break;
    }
  };

  const toggleVoice = async () => {
    if (isVoiceListening) {
      voiceService.stop();
    } else {
      await voiceService.start();
      if (voiceService.isListening) {
         speak("Voice systems online. Awaiting command.");
      }
    }
  };

  const handleNavigateToAnalyzer = (text: string) => {
    setAnalysisPayload(text);
    setCurrentView(View.ANALYZER);
  };

  return (
    <DashboardLayout currentView={currentView} onNavigate={setCurrentView}>
      
      {/* Voice HUD Overlay */}
      <VoiceHud 
        isListening={isVoiceListening} 
        onToggle={toggleVoice} 
        lastCommand={lastCommand}
        isAutonomous={isAutonomous}
      />

      {/* Main View Router */}
      {currentView === View.DASHBOARD && <Dashboard />}
      {currentView === View.LIVE_FEED && <LiveFeed />}
      {currentView === View.AUTO_CONTROL && <AutonomousControl />}
      {currentView === View.PIPELINE && <PipelineArchitecture />}
      {currentView === View.SENTIENT && <SentientCortex />}
      {currentView === View.GROWTH && <GrowthOptimization />}
      {currentView === View.PLAYBOOK && <OperationsPlaybook />}
      {currentView === View.AGENTS && <AgentOrchestration />}
      {currentView === View.PROMPTS && <PromptLibrary />}
      {currentView === View.SCRAPER && <ScraperArchitecture />}
      {currentView === View.INTEGRATIONS && <AffiliateIntegrations />}
      {currentView === View.TRACKING && <TrackingArchitecture />}
      {currentView === View.PARTNERS && <PartnerPortal />}
      {currentView === View.DEPLOYMENT && <DeploymentArchitecture />}
      {currentView === View.ANALYZER && <OfferAnalyzer initialText={analysisPayload} fallbackConfig={systemConfig.fallbackAi} />}
      {currentView === View.SETTINGS && <SettingsView config={systemConfig} setConfig={setSystemConfig} />}
      {currentView === View.OFFERS && <OfferCatalog onAnalyze={handleNavigateToAnalyzer} />}
      {currentView === View.EXPORT && <EngineerExport />}
    </DashboardLayout>
  );
};

export default App;

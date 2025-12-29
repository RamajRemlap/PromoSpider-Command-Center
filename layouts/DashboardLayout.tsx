import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: any;
  onNavigate: (view: any) => void;
}

const NebulaBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020617]">
    {/* Base Gradient Layer */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#050b1d] to-[#020617]"></div>

    {/* Dynamic Color Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-aurora-1"></div>
    <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/15 rounded-full blur-[100px] mix-blend-screen animate-aurora-2"></div>
    <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[130px] mix-blend-screen animate-aurora-3"></div>
    
    {/* Occasional Cyan Flash */}
    <div className="absolute top-[40%] left-[40%] w-[20vw] h-[20vw] bg-cyan-500/10 rounded-full blur-[90px] mix-blend-overlay animate-pulse" style={{ animationDuration: '8s' }}></div>

    {/* Technical Grid Overlay */}
    <svg className="absolute w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="neural-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#neural-grid)" />
    </svg>

    {/* Scanning Line */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-[scan_10s_linear_infinite]"></div>
    
    {/* Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]"></div>
  </div>
);

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen text-slate-100 flex overflow-hidden selection:bg-indigo-500/30 font-inter relative">
      
      {/* 1. Global Dynamic Background */}
      <NebulaBackground />

      {/* 2. Navigation Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        currentView={currentView} 
        onNavigate={onNavigate} 
      />

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Top Header */}
        <Header 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          title={currentView}
        />

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 relative">
           {/* Content Constraint for Large Screens */}
           <div className="max-w-[1800px] mx-auto w-full animate-in fade-in zoom-in-[0.99] duration-300">
             {children}
           </div>
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;
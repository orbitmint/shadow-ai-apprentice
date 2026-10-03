'use client';

import React, { useState } from 'react';
import { ApprenticeProvider, useApprentice } from '@/context/ApprenticeContext';
import { Header } from '@/components/Header';
import { SandboxERP } from '@/components/SandboxERP';
import { VoiceAgentPanel } from '@/components/VoiceAgentPanel';
import { WorkMapViewer } from '@/components/WorkMapViewer';
import { TeachModeView } from '@/components/TeachModeView';
import { MoonshotModal } from '@/components/MoonshotModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Rocket, Settings } from 'lucide-react';

function ApprenticeDashboard() {
  const { mode } = useApprentice();
  const [isMoonshotOpen, setIsMoonshotOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-slate-200 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header />

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {mode === 'capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <SandboxERP />
            </div>
            <div className="lg:col-span-4 h-[560px]">
              <VoiceAgentPanel />
            </div>
          </div>
        )}

        {mode === 'map' && <WorkMapViewer />}
        {mode === 'teach' && <TeachModeView />}
      </main>

      {/* Minimal Warm Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0c0e12]/90 py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setIsMoonshotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/20 transition shadow-sm"
          >
            <Rocket className="w-3.5 h-3.5" />
            Pitch Slide
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </footer>

      {/* Pitch Slide & Settings */}
      <MoonshotModal isOpen={isMoonshotOpen} onClose={() => setIsMoonshotOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default function Page() {
  return (
    <ApprenticeProvider>
      <ApprenticeDashboard />
    </ApprenticeProvider>
  );
}

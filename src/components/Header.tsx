'use client';

import React from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import {
  Sparkles,
  Eye,
  Map,
  GraduationCap,
  Mic,
  MicOff,
  CheckCircle2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    mode,
    setMode,
    isOffRecord,
    toggleOffRecord,
    agentStatus,
    startDebrief,
    isDebriefing,
  } = useApprentice();

  return (
    <header className="border-b border-white/[0.06] bg-[#0c0e12]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">The AI Apprentice</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ElevenLabs
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Learning Sabine&rsquo;s craft</p>
          </div>
        </div>

        {/* Friendly Mode Tabs */}
        <nav className="flex items-center bg-[#151921] border border-white/[0.08] rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setMode('capture')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'capture'
                ? 'bg-[#222834] text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            Capture
          </button>
          <button
            onClick={() => setMode('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'map'
                ? 'bg-[#222834] text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-indigo-400" />
            Playbook
          </button>
          <button
            onClick={() => setMode('teach')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'teach'
                ? 'bg-[#222834] text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Train Rook
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151921] border border-white/[0.08] text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                agentStatus === 'speaking'
                  ? 'bg-emerald-400 animate-ping'
                  : agentStatus === 'listening'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {agentStatus === 'speaking' ? 'Speaking...' : agentStatus === 'listening' ? 'Listening' : 'Ready'}
            </span>
          </div>

          {/* Off-record button */}
          <button
            onClick={toggleOffRecord}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              isOffRecord
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 shadow-sm'
                : 'bg-[#151921] text-slate-400 border-white/[0.08] hover:text-white hover:bg-[#1c222c]'
            }`}
            title="Toggle Off-the-Record"
          >
            {isOffRecord ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isOffRecord ? 'Off Record' : 'On Record'}</span>
          </button>

          {mode === 'capture' && (
            <button
              onClick={startDebrief}
              disabled={isDebriefing}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isDebriefing ? 'Reviewing...' : 'Done & Debrief'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

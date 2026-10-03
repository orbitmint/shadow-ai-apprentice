'use client';

import React, { useState } from 'react';
import { Bot, Play, ShieldAlert, CheckCircle2, AlertTriangle, X, Terminal, ArrowRight, RefreshCw } from 'lucide-react';
import { speakText } from '@/utils/elevenlabs';

interface AgentJob {
  id: string;
  vendor: string;
  amount: number;
  item: string;
  status: 'pending' | 'processing' | 'auto_approved' | 'auto_capitalized' | 'halted';
  haltReason?: string;
}

const SAMPLE_QUEUE: AgentJob[] = [
  {
    id: 'BATCH-01',
    vendor: 'Festo Pneumatics GmbH',
    amount: 1150.0,
    item: 'Pneumatic cylinder restock',
    status: 'pending',
  },
  {
    id: 'BATCH-02',
    vendor: 'Trumpf Laser Systems',
    amount: 8400.0,
    item: 'Laser cutting head replacement (AST-1042)',
    status: 'pending',
  },
  {
    id: 'BATCH-03',
    vendor: 'Delta Logistik GmbH',
    amount: 4200.0,
    item: 'December container storage & demurrage surcharge',
    status: 'pending',
  },
  {
    id: 'BATCH-04',
    vendor: 'Adolf Würth GmbH',
    amount: 620.0,
    item: 'Workshop drill bit pack',
    status: 'pending',
  },
];

export const AutonomousAgentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [queue, setQueue] = useState<AgentJob[]>(SAMPLE_QUEUE);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('Ready to execute Sabine’s Work Map instructions.');
  const [isHalted, setIsHalted] = useState(false);

  if (!isOpen) return null;

  const runAgent = async () => {
    setIsRunning(true);
    setIsHalted(false);
    setQueue(SAMPLE_QUEUE);

    // Job 1: Festo
    setCurrentStep('Job 1: Inspecting Festo Pneumatics (€1,150)...');
    await new Promise((r) => setTimeout(r, 900));
    setQueue((q) =>
      q.map((j) => (j.id === 'BATCH-01' ? { ...j, status: 'auto_approved' } : j))
    );
    setCurrentStep('Job 1: Under €5k threshold with slip. Auto-approved under OPEX 4711.');

    // Job 2: Trumpf
    await new Promise((r) => setTimeout(r, 1200));
    setCurrentStep('Job 2: Inspecting Trumpf Laser (€8,400)...');
    await new Promise((r) => setTimeout(r, 1000));
    setQueue((q) =>
      q.map((j) => (j.id === 'BATCH-02' ? { ...j, status: 'auto_capitalized' } : j))
    );
    setCurrentStep('Job 2: Capex rule triggered (> €5k). Verified asset tag AST-1042. Auto-coded to 0400.');

    // Job 3: Delta Logistik - GUARDRAIL HALT!
    await new Promise((r) => setTimeout(r, 1300));
    setCurrentStep('Job 3: Inspecting Delta Logistik (€4,200)...');
    await new Promise((r) => setTimeout(r, 1200));

    const haltMessage =
      "CRITICAL HALT: Triggered Sabine's Guardrail #3. Delta Logistik December freight double-billing detected. Autonomous execution suspended. Escalating to human.";
    
    setQueue((q) =>
      q.map((j) =>
        j.id === 'BATCH-03'
          ? {
              ...j,
              status: 'halted',
              haltReason: "Sabine's Guardrail #3: December demurrage double-billing risk.",
            }
          : j
      )
    );
    setCurrentStep(haltMessage);
    setIsHalted(true);
    setIsRunning(false);

    speakText("Autonomous agent halted by Sabine's guardrail. Delta Logistik December invoice flagged for human review.");
  };

  const resetQueue = () => {
    setQueue(SAMPLE_QUEUE);
    setIsHalted(false);
    setIsRunning(false);
    setCurrentStep('Ready to execute Sabine’s Work Map instructions.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131720] border border-white/[0.08] max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#181d28] p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Autonomous Agent Simulator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Page 5 Stretch Goal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Executing Sabine&rsquo;s Work Map rules autonomously • Gartner Failure Prevention Demo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/[0.06] rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Gartner Context Banner */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 leading-relaxed flex items-start gap-3">
            <Terminal className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Why this matters to Gartner:</strong>
              &ldquo;Over 40% of agentic AI projects fail due to inadequate risk controls.&rdquo; Most AI bots blindly pay fraudulent or duplicate invoices. With Sabine&rsquo;s Work Map loaded, the agent follows the routine path but <strong className="text-amber-300">stops dead in its tracks</strong> when a guardrail is reached.
            </div>
          </div>

          {/* Current Execution State */}
          <div className="p-3.5 rounded-xl bg-[#0c0e12] border border-white/[0.06] font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <span className={`w-2 h-2 rounded-full ${isHalted ? 'bg-rose-500 animate-ping' : isRunning ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="truncate">{currentStep}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={resetQueue}
                disabled={isRunning}
                className="p-1.5 hover:bg-white/[0.06] text-slate-400 hover:text-white rounded-lg transition"
                title="Reset batch"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={runAgent}
                disabled={isRunning}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isRunning ? 'Processing...' : 'Run Agent Batch'}
              </button>
            </div>
          </div>

          {/* Invoice Batch Table */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Incoming Invoice Stream
            </span>

            <div className="space-y-2">
              {queue.map((job) => {
                return (
                  <div
                    key={job.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      job.status === 'halted'
                        ? 'bg-rose-950/30 border-rose-600/60 shadow-lg ring-1 ring-rose-500/20'
                        : job.status === 'auto_approved' || job.status === 'auto_capitalized'
                        ? 'bg-[#181d28] border-emerald-500/30'
                        : 'bg-[#151922] border-white/[0.06]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-medium">{job.id}</span>
                        <span className="font-bold text-white">{job.vendor}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{job.item}</p>
                      {job.haltReason && (
                        <span className="text-[11px] text-rose-300 font-medium block mt-1.5 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          {job.haltReason}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-200">
                        €{job.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <div className="mt-1">
                        {job.status === 'auto_approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                            ✓ Auto-Approved
                          </span>
                        )}
                        {job.status === 'auto_capitalized' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/40">
                            ✓ Auto-Capex (0400)
                          </span>
                        )}
                        {job.status === 'halted' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-900 text-white border border-rose-600 animate-pulse">
                            🚨 Guardrail Halt
                          </span>
                        )}
                        {job.status === 'pending' && (
                          <span className="text-[10px] text-slate-500 font-mono">Queued</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181d28] border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Guaranteed Risk-Bounded Execution</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-950 font-semibold rounded-xl hover:bg-slate-200 transition"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};

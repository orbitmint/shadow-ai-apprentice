'use client';

import React, { useState } from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import { Volume2, GraduationCap, ChevronRight, Download, BookOpen, Building2, Server } from 'lucide-react';
import { speakText } from '@/utils/elevenlabs';

export const WorkMapViewer: React.FC = () => {
  const { workMap, debriefQuestions, setMode, scenario, switchScenario } = useApprentice();
  const [selectedStepId, setSelectedStepId] = useState<string>(
    workMap?.steps[0]?.id || 'step-1'
  );
  const [isPlayingTeachBack, setIsPlayingTeachBack] = useState(false);

  if (!workMap) return null;

  const selectedStep =
    workMap.steps.find((s) => s.id === selectedStepId) || workMap.steps[0];

  const handlePlayTeachBack = () => {
    setIsPlayingTeachBack(true);
    speakText(workMap.teachBackSummary, {
      onEnd: () => setIsPlayingTeachBack(false),
    });
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(workMap, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `playbook-${scenario}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Scenario Selector */}
      <div className="bg-[#131720] border border-white/[0.08] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{workMap.title}</h2>
              {/* Scenario Selector Dropdown directly on Playbook */}
              <select
                value={scenario}
                onChange={(e) => switchScenario(e.target.value as any)}
                className="bg-[#1a202c] border border-white/[0.1] rounded-lg px-2 py-0.5 text-[11px] text-amber-300 font-semibold focus:outline-none focus:border-amber-500/60 transition cursor-pointer"
              >
                <option value="ap">Sabine Weber (Accounts Payable)</option>
                <option value="incident">Marcus Vance (IT Incident Escalation)</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Captured from <span className="text-amber-400 font-medium">{workMap.expertName}</span> ({workMap.expertRole})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayTeachBack}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlayingTeachBack
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-[#1a202c] hover:bg-[#222938] text-slate-200 border border-white/[0.08]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            {isPlayingTeachBack ? 'Speaking...' : 'Listen to walkthrough'}
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1a202c] hover:bg-[#222938] text-slate-300 border border-white/[0.08] transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <button
            onClick={() => setMode('teach')}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1.5 transition shadow-sm shadow-amber-500/20"
          >
            <GraduationCap className="w-4 h-4" />
            Train Rook
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Debrief Questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {(debriefQuestions.length > 0 ? debriefQuestions : [
          {
            topic: scenario === 'incident' ? 'Reboot Policy' : 'Vendor Scope',
            question:
              scenario === 'incident'
                ? 'Under what exact threshold would you authorize a primary DB reboot instead of replica failover?'
                : 'You froze Delta Logistik for December. Is that strictly for Delta, or do you hold every carrier at year-end?',
          },
          {
            topic: scenario === 'incident' ? 'Lag Guardrail' : 'Missing Asset Tag',
            question:
              scenario === 'incident'
                ? 'If replica lag exceeds 5 seconds, do you still shift traffic or let connections queue up?'
                : 'If equipment is €7,200 without an asset tag, do you book to 0400 anyway, or leave it in opex while waiting?',
          },
          {
            topic: scenario === 'incident' ? 'Post-Mortem' : 'Sign-off',
            question:
              scenario === 'incident'
                ? 'Who is paged for incident approval if the primary cluster fails to elect a new leader?'
                : 'Who actually decides when to release a held freight invoice — you, logistics, or the plant controller?',
          },
        ]).map((dq, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#131720] border border-white/[0.06] space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block">
              {dq.topic}
            </span>
            <p className="text-xs text-slate-200 italic leading-relaxed pt-1">&ldquo;{dq.question}&rdquo;</p>
          </div>
        ))}
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Step list */}
        <div className="md:col-span-4 space-y-2.5">
          {workMap.steps.map((step) => {
            const isSelected = step.id === selectedStepId;
            return (
              <div
                key={step.id}
                onClick={() => setSelectedStepId(step.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all text-xs ${
                  isSelected
                    ? 'bg-[#1d2331] border-amber-500/60 text-white shadow-md ring-1 ring-amber-500/20'
                    : 'bg-[#131720] border-white/[0.06] hover:bg-[#181d28] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1 font-medium">
                  <span className="font-mono text-amber-400 font-semibold">Step {step.stepNumber}</span>
                  <span className="font-mono">{step.screenMoment.timestamp}</span>
                </div>
                <div className="font-semibold text-white leading-snug">{step.title}</div>
              </div>
            );
          })}
        </div>

        {/* Selected Step details */}
        <div className="md:col-span-8 bg-[#131720] border border-white/[0.08] rounded-2xl p-6 space-y-5 shadow-lg shadow-black/20">
          <div>
            <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              Step {selectedStep.stepNumber} • {selectedStep.screenMoment.timestamp}
            </span>
            <h3 className="text-base font-bold text-white mt-2 tracking-tight">{selectedStep.title}</h3>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              What expert did
            </span>
            <p className="text-xs text-slate-200 bg-[#0c0e12] p-3.5 rounded-xl border border-white/[0.06] leading-relaxed">
              {selectedStep.decision}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              Why expert did it
            </span>
            <p className="text-xs text-amber-100 italic bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl leading-relaxed">
              {selectedStep.reason}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
              Rules of thumb &amp; Guardrails
            </span>
            <div className="space-y-2">
              {selectedStep.guardrails.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0c0e12] text-xs text-slate-300 border border-white/[0.06] flex items-center gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

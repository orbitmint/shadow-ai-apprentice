'use client';

import React, { useState } from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import { AlertOctagon, CheckCircle2, RefreshCw, GraduationCap, Sparkles, Volume2, Play, MousePointer2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GhostCursor } from './GhostCursor';
import { speakText } from '@/utils/elevenlabs';

export const TeachModeView: React.FC = () => {
  const {
    teachInvoice,
    updateTeachInvoice,
    tutorFeedback,
    resetTeachMode,
    masteryScorecard,
  } = useApprentice();

  const [isGhostActive, setIsGhostActive] = useState(false);
  const [isPlayingSabine, setIsPlayingSabine] = useState(false);
  const [lang, setLang] = useState<'en' | 'de'>('en');

  const handleCostCenterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTeachInvoice({ currentCostCenter: e.target.value });
  };

  const handleApprove = () => {
    updateTeachInvoice({ status: 'approved' });
    if (teachInvoice.currentCostCenter.includes('0400')) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const triggerWrongDecision = () => {
    updateTeachInvoice({ currentCostCenter: '4711 • Workshop Operations (Opex)' });
    setIsGhostActive(true);
  };

  const triggerCorrectDecision = () => {
    updateTeachInvoice({
      currentCostCenter: '0400 • Fixed Assets (Capex)',
      assetNumber: 'AST-8820-ST',
    });
  };

  const playSabineVoice = () => {
    setIsPlayingSabine(true);
    const quote =
      lang === 'de'
        ? 'Alles über fünftausend Euro bei Ausrüstung muss steuerlich aktiviert werden. Wenn wir das in 4711 lassen, sieht die Werkstattmarge katastrophal aus.'
        : 'Anything over five grand for equipment has to be capex for tax depreciation. If you leave it in 4711, plant margins look awful and accounting will chase us down.';

    speakText(quote, {
      persona: 'sabine',
      onEnd: () => setIsPlayingSabine(false),
    });
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Banner */}
      <div className="bg-[#131720] border border-white/[0.08] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Hands-on Practice</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trainee: <span className="text-emerald-400 font-medium">Rook</span> • Following Sabine&rsquo;s playbook
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle (Stretch Goal: German / English transfer) */}
          <div className="flex items-center bg-[#1a202c] border border-white/[0.08] rounded-xl p-0.5 text-[11px] font-medium">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg transition ${
                lang === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setLang('de')}
              className={`px-2.5 py-1 rounded-lg transition ${
                lang === 'de' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Page 5 Stretch Goal: Sabine explains in German, tutor teaches in English"
            >
              🇩🇪 DE
            </button>
          </div>

          <button
            onClick={triggerWrongDecision}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition shadow-sm"
          >
            Pick Opex (Mistake)
          </button>
          <button
            onClick={triggerCorrectDecision}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 transition shadow-sm"
          >
            Pick Capex (Right)
          </button>
          <button
            onClick={resetTeachMode}
            className="p-1.5 rounded-lg bg-[#1a202c] hover:bg-[#222938] text-slate-400 hover:text-white transition"
            title="Reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        {/* Left: Fresh Invoice Case */}
        <div className="md:col-span-7 bg-[#131720] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between h-[460px] shadow-lg shadow-black/20 relative overflow-hidden">
          {/* Animated Ghost Cursor Overlay */}
          <GhostCursor isActive={isGhostActive} onComplete={() => setIsGhostActive(false)} />

          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {teachInvoice.invoiceNumber}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 tracking-tight">{teachInvoice.vendor}</h3>
                <span className="text-xs text-slate-400">{teachInvoice.vendorCategory}</span>
              </div>
              <span className="text-2xl font-mono font-bold text-amber-400">
                €{teachInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0c0e12] p-4 rounded-xl border border-white/[0.06]">
              {teachInvoice.description}
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Select Cost Center</span>
                {isGhostActive && (
                  <span className="text-amber-400 font-mono text-[11px] animate-pulse">
                    Sabine points here
                  </span>
                )}
              </div>
              <select
                value={teachInvoice.currentCostCenter}
                onChange={handleCostCenterSelect}
                className={`w-full bg-[#0c0e12] border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono transition ${
                  isGhostActive ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/[0.1] focus:border-amber-500/80'
                }`}
              >
                <option value="4711 • Workshop Operations (Opex)">
                  4711 • Workshop Operations (Opex)
                </option>
                <option value="0400 • Fixed Assets (Capex)">
                  0400 • Fixed Assets (Capex)
                </option>
                <option value="5200 • Freight & Shipping">
                  5200 • Freight & Shipping
                </option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <button
              onClick={handleApprove}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/40 transition active:scale-[0.99]"
            >
              Approve invoice
            </button>
          </div>
        </div>

        {/* Right: Live Tutor Feedback & Scorecard */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#131720] border border-white/[0.08] rounded-2xl p-5 space-y-3.5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">Voice Tutor (Apprentice)</span>
              </div>
              <button
                onClick={() => setIsGhostActive(true)}
                className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                title="Ghost Replay: Animate Sabine's mouse movement"
              >
                <MousePointer2 className="w-3 h-3" />
                Ghost Replay
              </button>
            </div>

            {tutorFeedback ? (
              <div
                className={`p-4 rounded-xl border space-y-3 shadow-sm ${
                  tutorFeedback.type === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {tutorFeedback.type === 'warning' ? (
                    <>
                      <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span className="text-rose-300">Hold up a second!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Spot on!</span>
                    </>
                  )}
                </div>

                <p className="text-xs italic leading-relaxed">&ldquo;{tutorFeedback.message}&rdquo;</p>

                {tutorFeedback.momentReplay && (
                  <div className="pt-2.5 border-t border-rose-500/20 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-semibold">How Sabine handled it:</span>
                      {/* Dual-Voice Button */}
                      <button
                        onClick={playSabineVoice}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                          isPlayingSabine
                            ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                            : 'bg-[#181d28] text-amber-300 border-amber-500/30 hover:bg-[#222938]'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        {isPlayingSabine ? 'Sabine Speaking...' : 'Hear Sabine’s Voice'}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0c0e12]/80 border border-white/[0.06] font-mono text-slate-300">
                      {lang === 'de' ? (
                        <span>
                          🇩🇪 <em>&ldquo;Alles über 5.000 € bei Ausrüstung muss aktiviert werden.&rdquo;</em>
                        </span>
                      ) : (
                        tutorFeedback.momentReplay
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed bg-[#0c0e12]/60 p-3.5 rounded-xl border border-white/[0.06]">
                Tutor is watching Rook&rsquo;s screen. If Rook tries to book €6,850 to workshop opex, the tutor jumps in before anything gets saved.
              </p>
            )}
          </div>

          {/* Mastery Scorecard */}
          <div className="bg-[#131720] border border-white/[0.08] rounded-2xl p-5 space-y-2.5 text-xs shadow-lg shadow-black/20">
            <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block">
              Rook&rsquo;s progress checklist
            </span>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.06]">
              <span className="text-slate-200">5k Capex cutoff</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  masteryScorecard.capexThreshold
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    : 'text-slate-500'
                }`}
              >
                {masteryScorecard.capexThreshold ? '✓ Nailed it' : 'Needs practice'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.06]">
              <span className="text-slate-200">Asset tag verification</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  masteryScorecard.assetTagCheck
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    : 'text-slate-500'
                }`}
              >
                {masteryScorecard.assetTagCheck ? '✓ Nailed it' : 'Needs practice'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

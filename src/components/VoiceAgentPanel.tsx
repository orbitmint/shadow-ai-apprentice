'use client';

import React, { useState } from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import { Volume2, Send, Bot } from 'lucide-react';

export const VoiceAgentPanel: React.FC = () => {
  const {
    scenario,
    currentQuestion,
    dialogue,
    submitExpertAnswer,
    isOffRecord,
  } = useApprentice();

  const [inputAnswer, setInputAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim()) return;
    submitExpertAnswer(inputAnswer);
    setInputAnswer('');
  };

  const handleQuickAnswer = (ans: string) => {
    submitExpertAnswer(ans);
  };

  return (
    <div className="bg-[#131720] border border-white/[0.08] rounded-2xl flex flex-col h-full overflow-hidden shadow-lg shadow-black/20">
      {/* Friendly Header */}
      <div className="bg-[#181d28] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Voice Apprentice</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {isOffRecord ? 'Paused' : 'ElevenLabs'}
        </span>
      </div>

      {/* Dialogue List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin">
        {/* Active Question Card */}
        {currentQuestion && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Apprentice asked:</span>
            </div>
            <p className="text-xs text-white italic leading-relaxed">
              &ldquo;{currentQuestion}&rdquo;
            </p>

            {/* Quick Answer Chips (Dynamic based on active scenario) */}
            <div className="pt-2 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Quick responses:</span>
              {scenario === 'incident' ? (
                <>
                  <button
                    onClick={() =>
                      handleQuickAnswer(
                        'Rebooting the primary on a Tier 1 customer during 2 PM peak traffic kills 12,000 active transactions. Shift traffic to replica 4B instead.'
                      )
                    }
                    className="text-left text-[11px] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-medium"
                  >
                    &ldquo;Peak hours: reboot drops 12k sessions&rdquo;
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAnswer(
                        'Between noon and 5 PM EST, a primary reboot is strictly forbidden. If connection pools exceed 85%, failover to replica pool first.'
                      )
                    }
                    className="text-left text-[11px] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-medium"
                  >
                    &ldquo;12-5 PM EST primary reboot forbidden&rdquo;
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAnswer(
                        'Restarting ingress pods causes a stampede. Clear the Redis idempotency cache first.'
                      )
                    }
                    className="text-left text-[11px] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-medium"
                  >
                    &ldquo;Purge Redis cache before restarting pods&rdquo;
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleQuickAnswer('Anything over five grand for equipment has to be capex.')
                    }
                    className="text-left text-[11px] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-medium"
                  >
                    &ldquo;Over 5k is always capex&rdquo;
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAnswer('Delta tries to double-bill container fees every December.')
                    }
                    className="text-left text-[11px] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-medium"
                  >
                    &ldquo;Delta double-bills every Dec&rdquo;
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAnswer('If there is no asset tag, stop right there and ping the controller.')
                    }
                    className="text-left text-[11px] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-medium"
                  >
                    &ldquo;No asset tag = don&rsquo;t touch it&rdquo;
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Turns */}
        {dialogue.map((turn) => {
          if (turn.speaker === 'system') return null;
          const isAgent = turn.speaker === 'agent';

          return (
            <div
              key={turn.id}
              className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
            >
              <span className="text-[10px] text-slate-400 mb-1 font-medium">
                {isAgent ? 'Apprentice' : scenario === 'incident' ? 'Marcus' : 'Sabine'}
              </span>
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                  isAgent
                    ? 'bg-[#1b212d] text-slate-200 border border-white/[0.08] rounded-tl-sm'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-sm'
                }`}
              >
                {turn.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 bg-[#181d28] border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            disabled={isOffRecord}
            placeholder={isOffRecord ? 'Off the record...' : "Type what you're thinking..."}
            className="flex-1 bg-[#0c0e12] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={isOffRecord || !inputAnswer.trim()}
            className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

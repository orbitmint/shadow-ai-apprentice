'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import { Volume2, Send, Bot, Mic, MicOff, Sparkles } from 'lucide-react';

export const VoiceAgentPanel: React.FC = () => {
  const {
    scenario,
    currentQuestion,
    dialogue,
    submitExpertAnswer,
    isOffRecord,
  } = useApprentice();

  const [inputAnswer, setInputAnswer] = useState('');
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Setup browser native Speech-to-Text (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputAnswer(transcript);
        };

        recognition.onend = () => {
          setIsRecordingMic(false);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e);
          setIsRecordingMic(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleMic = () => {
    if (isRecordingMic) {
      recognitionRef.current?.stop();
      setIsRecordingMic(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecordingMic(true);
        } catch (err) {
          console.warn('Mic start notice:', err);
        }
      } else {
        alert('Voice input is supported in Chrome, Safari, and Edge browsers.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim()) return;
    submitExpertAnswer(inputAnswer);
    setInputAnswer('');
    if (isRecordingMic) {
      recognitionRef.current?.stop();
      setIsRecordingMic(false);
    }
  };

  const handleQuickAnswer = (ans: string) => {
    submitExpertAnswer(ans);
    if (isRecordingMic) {
      recognitionRef.current?.stop();
      setIsRecordingMic(false);
    }
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
          {isOffRecord ? 'Paused' : 'ElevenLabs Active'}
        </span>
      </div>

      {/* Dialogue Stream */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin">
        {/* Active Spoken Question Card */}
        {currentQuestion && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2.5 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Apprentice asked:</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Speak or type your answer</span>
            </div>

            <p className="text-xs text-white italic leading-relaxed">
              &ldquo;{currentQuestion}&rdquo;
            </p>

            <div className="pt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={toggleMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  isRecordingMic
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-[#1a202c] hover:bg-[#222938] text-amber-300 border-white/[0.08]'
                }`}
              >
                {isRecordingMic ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecordingMic ? 'Listening to voice...' : 'Speak Answer'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickAnswer(
                    scenario === 'incident'
                      ? 'Rebooting during peak traffic kills 12,000 active transactions. Shift traffic to replica 4B instead.'
                      : 'Anything in equipment over five grand has to be capex for tax depreciation.'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#1a202c] hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-medium transition"
              >
                <span>
                  {scenario === 'incident'
                    ? '💬 1-Click: "Shift to replica 4B"'
                    : '💬 1-Click: "Over 5k is capex"'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Conversation Turns */}
        {dialogue.map((turn) => {
          if (turn.speaker === 'system') return null;
          const isAgent = turn.speaker === 'agent';

          return (
            <div
              key={turn.id}
              className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
            >
              <span className="text-[10px] text-slate-400 mb-1 font-medium">
                {isAgent ? 'Apprentice' : scenario === 'incident' ? 'Marcus (Expert)' : 'Sabine (Expert)'}
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

      {/* Voice & Text Input Bar */}
      <div className="p-3 bg-[#181d28] border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Live Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={isOffRecord}
            className={`p-2 rounded-xl border transition ${
              isRecordingMic
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-[#0c0e12] text-amber-400 border-white/[0.1] hover:bg-white/[0.06]'
            }`}
            title="Click to speak your explanation"
          >
            {isRecordingMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            disabled={isOffRecord}
            placeholder={
              isRecordingMic
                ? 'Listening... speak now'
                : isOffRecord
                ? 'Off the record...'
                : 'Explain your reasoning to the apprentice...'
            }
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

'use client';

import React from 'react';
import { Rocket, Sparkles, X, Brain, Network, Users, Globe2, ShieldCheck } from 'lucide-react';

export const MoonshotModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Pitch Slide Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-purple-700 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-black/20 hover:bg-black/40 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-200 mb-2">
            <Rocket className="w-4 h-4" />
            Hack-Nation Pitch Slide • The Moonshot
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            The Living Global Operations Manual
          </h2>
          <p className="text-sm text-orange-100 max-w-2xl mt-1.5 leading-relaxed">
            From capturing Sabine&rsquo;s 24 years of tacit judgment today — to an always-on, cross-enterprise nervous system that trains people first, then safely deploys autonomous agents.
          </p>
        </div>

        {/* 4 Pillars of the Moonshot */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">1. The Living Company Memory</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every expert and every workflow united into an evolving knowledge graph. As ERP systems and regulations shift, the apprentice detects drift and asks only about what is genuinely new.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">2. The Always-On Ambient Apprentice</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero scheduled shadowing sessions. Powered by ElevenLabs Scribe v2 Realtime, it lives passively in the background, speaking up with one surgical question only when a true anomaly arises.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">3. People First, Then Autonomous Agents</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Playbooks train new hires like Rook today; tomorrow, those exact same guardrails let software agents run routine workflows safely while people make the judgment calls.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">4. The World&rsquo;s Operations Manual</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Anonymized, PII-scrubbed Work Maps across thousands of enterprises across O*NET&rsquo;s 1,016 occupations. Democratizing how the world&rsquo;s digital work is truly done.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Presidio Privacy Redaction &amp; Off-The-Record Built-in</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition"
          >
            Close Slide
          </button>
        </div>
      </div>
    </div>
  );
};

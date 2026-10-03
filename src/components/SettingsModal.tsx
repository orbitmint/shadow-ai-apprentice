'use client';

import React, { useState } from 'react';
import { Settings, Key, X, Check, Eye, EyeOff, Bot, Sparkles } from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Apprentice Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status of Local Gemini CLI */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-2.5">
          <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300">
            <span className="font-semibold text-white block">Gemini CLI Active</span>
            Connected to <code className="text-amber-400 font-mono">/opt/homebrew/bin/gemini</code>. Ready for headless reasoning with zero Google API keys required.
          </div>
        </div>

        <div className="space-y-4">
          {/* ElevenLabs API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
              <span>ElevenLabs API Key (Voice)</span>
              <span className="text-[10px] text-zinc-400 font-mono">ELEVENLABS_API_KEY</span>
            </label>
            <div className="relative">
              <input
                type={showKeys ? 'text' : 'password'}
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                placeholder="sk_..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Anthropic Claude API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
              <span>Anthropic Claude API Key (Vision / Brain)</span>
              <span className="text-[10px] text-purple-400 font-mono">ANTHROPIC_API_KEY</span>
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-[10px] text-zinc-500">
              Optional: Uses Claude 3.5 Sonnet / Haiku for vision analysis and debrief generation.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            {saved ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
};

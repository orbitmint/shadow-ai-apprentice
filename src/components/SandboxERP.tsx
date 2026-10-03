'use client';

import React, { useState } from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import { InvoiceItem } from '@/types/apprentice';
import { INITIAL_INVOICES } from '@/utils/mockData';
import { CheckCircle, Clock, Play, RotateCcw, Building2 } from 'lucide-react';

export const SandboxERP: React.FC = () => {
  const { recordScreenEvent } = useApprentice();
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('inv-4471');

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  const handleCostCenterChange = (newCostCenter: string) => {
    const oldVal = selectedInvoice.currentCostCenter;
    const updated = invoices.map((inv) =>
      inv.id === selectedInvoice.id ? { ...inv, currentCostCenter: newCostCenter } : inv
    );
    setInvoices(updated);

    const isCapex = newCostCenter.includes('0400');
    recordScreenEvent({
      action: 'Changed Cost Center',
      targetField: 'Cost Center',
      oldValue: oldVal,
      newValue: newCostCenter,
      description: `Re-coded ${selectedInvoice.invoiceNumber} to ${newCostCenter}`,
      isGuardrailTrigger: isCapex && selectedInvoice.amount > 5000,
      guardrailNote: isCapex ? '5k capex cutoff rule' : undefined,
      suggestedQuestion: isCapex
        ? `Quick question Sabine — why'd you flip Invoice ${selectedInvoice.invoiceNumber} over to 0400?`
        : undefined,
    });
  };

  const handleStatusChange = (newStatus: 'approved' | 'held' | 'escalated') => {
    const oldStatus = selectedInvoice.status;
    const updated = invoices.map((inv) =>
      inv.id === selectedInvoice.id ? { ...inv, status: newStatus } : inv
    );
    setInvoices(updated);

    const isDecemberHold = newStatus === 'held' && selectedInvoice.vendor.includes('Delta');

    recordScreenEvent({
      action: `Set Status to ${newStatus.toUpperCase()}`,
      targetField: 'Status',
      oldValue: oldStatus,
      newValue: newStatus,
      description: `Marked invoice ${selectedInvoice.invoiceNumber} as ${newStatus}`,
      isGuardrailTrigger: isDecemberHold,
      guardrailNote: isDecemberHold ? 'December supplier double-billing safeguard' : undefined,
      suggestedQuestion: isDecemberHold
        ? "Saw you put Delta Logistik on hold instead of approving it. What's the story with them?"
        : `What did you double-check before approving ${selectedInvoice.invoiceNumber}?`,
    });
  };

  const runSabineDemo = async () => {
    setSelectedInvoiceId('inv-4471');
    setTimeout(() => {
      handleCostCenterChange('0400 • Fixed Assets (Capex)');
    }, 1000);

    setTimeout(() => {
      setSelectedInvoiceId('inv-4472');
    }, 4500);
    setTimeout(() => {
      handleStatusChange('approved');
    }, 6000);

    setTimeout(() => {
      setSelectedInvoiceId('inv-4473');
    }, 9000);
    setTimeout(() => {
      handleStatusChange('held');
    }, 10500);
  };

  return (
    <div className="bg-[#131720] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex flex-col h-[560px]">
      {/* Friendly Sub-Header */}
      <div className="bg-[#181d28] px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">
            Stuttgart Invoicing Queue <span className="text-slate-400 font-normal">• Sabine Weber</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSabineDemo}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs rounded-lg shadow-sm shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            Play Sabine&rsquo;s Steps
          </button>
          <button
            onClick={() => setInvoices(INITIAL_INVOICES)}
            className="p-1 hover:bg-white/[0.06] rounded-md text-slate-400 hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
        {/* Left: Invoice List */}
        <div className="md:col-span-5 border-r border-white/[0.06] p-3 space-y-2 bg-[#0f1219]/60 overflow-y-auto">
          {invoices.map((inv) => {
            const isSelected = inv.id === selectedInvoiceId;
            return (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoiceId(inv.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                  isSelected
                    ? 'bg-[#1e2433] border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-[#151922] border-white/[0.06] hover:bg-[#1a202c] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 font-medium">{inv.invoiceNumber}</span>
                  <span className="font-mono font-bold text-slate-100">
                    €{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="font-medium mt-1 truncate text-slate-200">{inv.vendor}</div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.05] text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                      inv.status === 'approved'
                        ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-800/40'
                        : inv.status === 'held'
                        ? 'text-rose-300 bg-rose-950/50 border border-rose-800/40'
                        : 'text-amber-300 bg-amber-950/50 border border-amber-800/40'
                    }`}
                  >
                    ● {inv.status}
                  </span>
                  <span className="text-slate-400 truncate max-w-[130px]">
                    {inv.currentCostCenter.split(' • ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Details */}
        <div className="md:col-span-7 p-6 flex flex-col justify-between bg-[#131720]/80">
          <div className="space-y-5">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">{selectedInvoice.vendor}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedInvoice.invoiceNumber} • {selectedInvoice.vendorCategory}
                  </div>
                </div>
                <span className="text-2xl font-mono font-bold text-amber-400">
                  €{selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-3.5 leading-relaxed bg-[#171c26] p-3.5 rounded-xl border border-white/[0.06]">
                {selectedInvoice.description}
              </p>
            </div>

            {/* Cost Center selector */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Cost Center Allocation</span>
                {selectedInvoice.amount > 5000 && (
                  <span className="text-[10px] text-amber-400 font-semibold">Over €5,000 Threshold</span>
                )}
              </div>
              <select
                value={selectedInvoice.currentCostCenter}
                onChange={(e) => handleCostCenterChange(e.target.value)}
                className="w-full bg-[#0c0e12] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 font-mono transition"
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

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
            <button
              onClick={() => handleStatusChange('held')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                selectedInvoice.status === 'held'
                  ? 'bg-rose-950/60 border-rose-700 text-rose-200'
                  : 'bg-[#181d28] border-white/[0.08] text-slate-300 hover:text-rose-300 hover:border-rose-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Hold invoice
            </button>

            <button
              onClick={() => handleStatusChange('approved')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                selectedInvoice.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useApprentice } from '@/context/ApprenticeContext';
import { InvoiceItem } from '@/types/apprentice';
import { INITIAL_INVOICES } from '@/utils/mockData';
import { IncidentItem, INITIAL_INCIDENTS } from '@/utils/incidentData';
import { CheckCircle, Clock, Play, RotateCcw, Building2, Server, ShieldAlert, Cpu } from 'lucide-react';

export const SandboxERP: React.FC = () => {
  const { recordScreenEvent, scenario, switchScenario, submitExpertAnswer } = useApprentice();
  
  // AP State
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('inv-4471');
  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  // Incident State
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-8822');
  const selectedIncident = incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0];

  // AP Handlers
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

  // Incident Handlers
  const handleMitigationChange = (actionName: string) => {
    const updated = incidents.map((inc) =>
      inc.id === selectedIncident.id ? { ...inc, currentAction: actionName } : inc
    );
    setIncidents(updated);

    const isReplicaShift = actionName.includes('Replica');
    recordScreenEvent({
      action: actionName,
      targetField: 'Traffic Routing',
      description: `${selectedIncident.incidentNumber}: ${actionName}`,
      isGuardrailTrigger: isReplicaShift,
      guardrailNote: isReplicaShift ? 'Peak hour primary reboot prohibition' : undefined,
      suggestedQuestion: isReplicaShift
        ? "Quick question Marcus — why'd you failover traffic to replica 4B instead of rebooting the primary DB node?"
        : undefined,
    });
  };

  // Sequential Demo Helper
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Quick Demo Runs (Completes a single full interaction end-to-end with zero jumping)
  const runSabineDemo = async () => {
    if (isRunningDemo) return;
    setIsRunningDemo(true);

    try {
      // 1. Switch Invoice 4471 to Capex 0400
      setSelectedInvoiceId('inv-4471');
      await wait(600);
      handleCostCenterChange('0400 • Fixed Assets (Capex)');

      // 2. Allow apprentice question to speak cleanly and pause
      await wait(5000);

      // 3. Sabine speaks her explanation and apprentice acknowledges
      await submitExpertAnswer(
        'Anything in equipment over five grand has to be capex for tax depreciation.',
        true
      );
    } finally {
      setIsRunningDemo(false);
    }
  };

  const runMarcusDemo = async () => {
    if (isRunningDemo) return;
    setIsRunningDemo(true);

    try {
      // 1. Failover Shard 4B
      setSelectedIncidentId('inc-8822');
      await wait(600);
      handleMitigationChange('Shift Ingress to Read-Replica Shard 4B');

      // 2. Allow apprentice question to speak cleanly and pause
      await wait(5000);

      // 3. Marcus speaks his explanation and apprentice acknowledges
      await submitExpertAnswer(
        'Rebooting during peak traffic kills 12,000 active transactions. Shift traffic to replica 4B instead.',
        true
      );
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="bg-[#131720] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex flex-col h-[560px]">
      {/* Scenario Selector & Header */}
      <div className="bg-[#181d28] px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {scenario === 'ap' ? (
            <Building2 className="w-4 h-4 text-amber-400" />
          ) : (
            <Server className="w-4 h-4 text-purple-400" />
          )}

          {/* Scenario Switcher Dropdown */}
          <select
            value={scenario}
            onChange={(e) => switchScenario(e.target.value as any)}
            className="bg-[#0c0e12] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-500/60 transition cursor-pointer"
          >
            <option value="ap">Accounts Payable (Sabine Weber, 24y)</option>
            <option value="incident">IT Incident Escalation (Marcus Vance, 16y)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {scenario === 'ap' ? (
            <button
              onClick={runSabineDemo}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs rounded-lg shadow-sm shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              Play Sabine&rsquo;s Steps
            </button>
          ) : (
            <button
              onClick={runMarcusDemo}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm shadow-purple-500/20 transition-all active:scale-[0.98]"
            >
              <Play className="w-3 h-3 fill-white" />
              Play Marcus&rsquo;s Steps
            </button>
          )}

          <button
            onClick={() => {
              setInvoices(INITIAL_INVOICES);
              setIncidents(INITIAL_INCIDENTS);
            }}
            className="p-1 hover:bg-white/[0.06] rounded-md text-slate-400 hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Either AP or Incident */}
      {scenario === 'ap' ? (
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

          {/* Right: Selected Invoice Details */}
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
      ) : (
        /* Scenario 2: IT Incident Escalation */
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Incident Queue */}
          <div className="md:col-span-5 border-r border-white/[0.06] p-3 space-y-2 bg-[#0f1219]/60 overflow-y-auto">
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-[#1e2433] border-purple-500/50 text-white shadow-sm ring-1 ring-purple-500/20'
                      : 'bg-[#151922] border-white/[0.06] hover:bg-[#1a202c] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-400 font-semibold">{inc.incidentNumber}</span>
                    <span className="text-[10px] font-mono text-slate-400">{inc.timestamp}</span>
                  </div>
                  <div className="font-semibold mt-1 truncate text-white">{inc.service}</div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.05] text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        inc.severity.includes('P1')
                          ? 'text-rose-300 bg-rose-950/60 border border-rose-800/40 animate-pulse'
                          : 'text-amber-300 bg-amber-950/50 border border-amber-800/40'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-slate-400">{inc.customerTier}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Incident Mitigation */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between bg-[#131720]/80">
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{selectedIncident.service}</h3>
                    <div className="text-xs text-purple-300 font-mono mt-0.5">
                      {selectedIncident.incidentNumber} • {selectedIncident.targetSystem}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800/50">
                    {selectedIncident.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-3.5 leading-relaxed bg-[#171c26] p-3.5 rounded-xl border border-white/[0.06]">
                  {selectedIncident.summary}
                </p>
              </div>

              {/* Triage Mitigation selector */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>Mitigation Triage Action</span>
                  <span className="text-[10px] text-amber-400 font-semibold">Peak Hours (12-5 PM EST)</span>
                </div>
                <select
                  value={selectedIncident.currentAction}
                  onChange={(e) => handleMitigationChange(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500/80 font-mono transition"
                >
                  <option value="Pending Mitigation">Pending Mitigation</option>
                  <option value="Reboot Primary DB Node">Reboot Primary DB Node</option>
                  <option value="Shift Ingress to Read-Replica Shard 4B">Shift Ingress to Read-Replica Shard 4B</option>
                  <option value="Purge Redis Idempotency Cache">Purge Redis Idempotency Cache</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
              <button
                onClick={() => handleMitigationChange('Reboot Primary DB Node')}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#181d28] border border-white/[0.08] text-rose-400 hover:bg-rose-950/40 transition"
              >
                Reboot Primary Node
              </button>

              <button
                onClick={() => handleMitigationChange('Shift Ingress to Read-Replica Shard 4B')}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md transition"
              >
                Failover to Replica 4B
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

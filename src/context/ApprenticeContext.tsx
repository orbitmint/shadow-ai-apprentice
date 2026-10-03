'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ScreenEvent,
  DialogueTurn,
  WorkMap,
  InvoiceItem,
  WorkMapStep,
} from '@/types/apprentice';
import {
  INITIAL_INVOICES,
  INITIAL_WORK_MAP,
  INITIAL_DIALOGUE_HISTORY,
  TEACH_MODE_INVOICE,
} from '@/utils/mockData';
import { speakText, stopSpeaking } from '@/utils/elevenlabs';

type AppMode = 'capture' | 'map' | 'teach';

interface ApprenticeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  // Capture State
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
  isOffRecord: boolean;
  toggleOffRecord: () => void;
  piiShieldEnabled: boolean;
  togglePiiShield: () => void;
  // Screen media stream
  mediaStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  // Voice & Conversation
  agentStatus: 'idle' | 'listening' | 'speaking' | 'analyzing';
  currentQuestion: string | null;
  dialogue: DialogueTurn[];
  askAgentQuestion: (question: string, context?: string, isGuardrail?: boolean) => Promise<void>;
  submitExpertAnswer: (answer: string) => Promise<void>;
  // Events & Timeline
  events: ScreenEvent[];
  recordScreenEvent: (event: Partial<ScreenEvent>) => void;
  // Work Map & Debrief
  workMap: WorkMap | null;
  setWorkMap: (map: WorkMap) => void;
  isDebriefing: boolean;
  debriefQuestions: any[];
  startDebrief: () => Promise<void>;
  confirmWorkMap: () => void;
  // Teach Mode
  teachInvoice: InvoiceItem;
  updateTeachInvoice: (updates: Partial<InvoiceItem>) => void;
  tutorFeedback: { message: string; type: 'warning' | 'success' | 'info'; momentReplay?: string } | null;
  resetTeachMode: () => void;
  masteryScorecard: { capexThreshold: boolean; assetTagCheck: boolean; decemberVendorCheck: boolean };
}

const ApprenticeContext = createContext<ApprenticeContextType | null>(null);

export const ApprenticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('capture');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isOffRecord, setIsOffRecord] = useState<boolean>(false);
  const [piiShieldEnabled, setPiiShieldEnabled] = useState<boolean>(true);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'listening' | 'speaking' | 'analyzing'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Events & Dialogue
  const [events, setEvents] = useState<ScreenEvent[]>([]);
  const [dialogue, setDialogue] = useState<DialogueTurn[]>(INITIAL_DIALOGUE_HISTORY);
  const [workMap, setWorkMap] = useState<WorkMap | null>(INITIAL_WORK_MAP);
  const [isDebriefing, setIsDebriefing] = useState<boolean>(false);
  const [debriefQuestions, setDebriefQuestions] = useState<any[]>([]);

  // Teach Mode State
  const [teachInvoice, setTeachInvoice] = useState<InvoiceItem>(TEACH_MODE_INVOICE);
  const [tutorFeedback, setTutorFeedback] = useState<{
    message: string;
    type: 'warning' | 'success' | 'info';
    momentReplay?: string;
  } | null>(null);
  const [masteryScorecard, setMasteryScorecard] = useState({
    capexThreshold: false,
    assetTagCheck: false,
    decemberVendorCheck: false,
  });

  // Screen Capture Logic
  const startCapture = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser' },
          audio: false,
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        stream.getVideoTracks()[0].onended = () => {
          stopCapture();
        };
      }
      setIsCapturing(true);
      setAgentStatus('listening');

      // Introduction voice prompt
      const intro = "Watching over your shoulder Sabine. I'll jump in only if I see something interesting.";
      askAgentQuestion(intro, 'Session Started', false);
    } catch (err) {
      console.warn('Screen share cancelled or not allowed:', err);
      // Still enable capturing in simulated ERP mode
      setIsCapturing(true);
      setAgentStatus('listening');
    }
  };

  const stopCapture = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsCapturing(false);
    setAgentStatus('idle');
    stopSpeaking();
  };

  const toggleOffRecord = () => {
    setIsOffRecord((prev) => {
      const next = !prev;
      if (next) {
        setDialogue((d) => [
          ...d,
          {
            id: `sys-${Date.now()}`,
            speaker: 'system',
            text: '🔒 Off the record. Notes paused.',
            timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          },
        ]);
      } else {
        setDialogue((d) => [
          ...d,
          {
            id: `sys-${Date.now()}`,
            speaker: 'system',
            text: '🟢 Back on the record.',
            timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          },
        ]);
      }
      return next;
    });
  };

  const togglePiiShield = () => {
    setPiiShieldEnabled((prev) => !prev);
  };

  const askAgentQuestion = async (question: string, context?: string, isGuardrail: boolean = false) => {
    if (isOffRecord) return;

    setCurrentQuestion(question);
    setAgentStatus('speaking');

    const newTurn: DialogueTurn = {
      id: `q-${Date.now()}`,
      speaker: 'agent',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      isGuardrail,
      questionContext: context,
    };

    setDialogue((prev) => [...prev, newTurn]);

    await speakText(question, {
      onEnd: () => {
        setAgentStatus('listening');
      },
    });
  };

  const submitExpertAnswer = async (answer: string) => {
    const expertTurn: DialogueTurn = {
      id: `a-${Date.now()}`,
      speaker: 'expert',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    };

    setDialogue((prev) => [...prev, expertTurn]);
    setCurrentQuestion(null);
    setAgentStatus('listening');

    // Acknowledge briefly
    const ack = "Got it, noted that down.";
    speakText(ack);
  };

  const recordScreenEvent = (eventData: Partial<ScreenEvent>) => {
    if (isOffRecord) return;

    const newEvent: ScreenEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      seconds: Math.floor(Date.now() / 1000),
      action: eventData.action || 'User action',
      targetField: eventData.targetField,
      oldValue: eventData.oldValue,
      newValue: eventData.newValue,
      description: eventData.description || 'Interacted with screen',
      screenshotUrl: eventData.screenshotUrl,
      isGuardrailTrigger: eventData.isGuardrailTrigger,
      guardrailNote: eventData.guardrailNote,
      suggestedQuestion: eventData.suggestedQuestion,
    };

    setEvents((prev) => [newEvent, ...prev]);

    // If an action has a suggested question and agent is idle/listening, ask it!
    if (newEvent.suggestedQuestion && agentStatus !== 'speaking') {
      setTimeout(() => {
        askAgentQuestion(
          newEvent.suggestedQuestion!,
          newEvent.guardrailNote || newEvent.action,
          newEvent.isGuardrailTrigger
        );
      }, 1200); // Natural pause delay
    }
  };

  // Debrief & Work Map Generation
  const startDebrief = async () => {
    setIsDebriefing(true);
    setAgentStatus('analyzing');

    try {
      const res = await fetch('/api/debrief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          transcript: dialogue,
          expertName: 'Sabine Weber',
        }),
      });

      const data = await res.json();
      setDebriefQuestions(data.debriefQuestions || []);
      if (data.workMap) {
        setWorkMap(data.workMap);
      }

      setMode('map');
      setAgentStatus('speaking');

      const teachBack = `Alright Sabine, let me run through this to make sure I got it straight: ${data.teachBackSummary}`;
      speakText(teachBack, {
        onEnd: () => {
          setAgentStatus('listening');
        },
      });
    } catch (err) {
      console.error('Debrief error:', err);
      setMode('map');
      setAgentStatus('idle');
    } finally {
      setIsDebriefing(false);
    }
  };

  const confirmWorkMap = () => {
    if (workMap) {
      const confirmedSteps = workMap.steps.map((s) => ({ ...s, confirmedByExpert: true }));
      setWorkMap({ ...workMap, steps: confirmedSteps });
    }
    const praise = 'Playbook confirmed. Ready to train Rook.';
    speakText(praise);
  };

  // Teach Mode Interception Logic
  const updateTeachInvoice = (updates: Partial<InvoiceItem>) => {
    const updated = { ...teachInvoice, ...updates };
    setTeachInvoice(updated);

    // Guardrail Check 1: Capex threshold rule (> €5,000 must be 0400)
    if (
      updates.currentCostCenter &&
      updates.currentCostCenter.includes('4711') &&
      updated.amount > 5000
    ) {
      const warning =
        "Hold up, Rook! Sabine wouldn't put that in 4711. It's a €6,850 spindle — anything over five grand has to go to Capex 0400. Switch the code first.";
      setTutorFeedback({
        message: warning,
        type: 'warning',
        momentReplay: 'Sabine at 03:12: Switched to 0400 Capex because spindle was over €5,000.',
      });
      speakText(warning);
      return;
    }

    // Success on Capex rule
    if (
      updates.currentCostCenter &&
      updates.currentCostCenter.includes('0400') &&
      updated.amount > 5000
    ) {
      const praise =
        "Spot on, Rook! Over five grand is always capex. Good catch.";
      setTutorFeedback({
        message: praise,
        type: 'success',
        momentReplay: undefined,
      });
      setMasteryScorecard((prev) => ({ ...prev, capexThreshold: true }));
      speakText(praise);
      return;
    }

    // Guardrail Check 2: Missing Asset Number
    if (updates.status === 'approved' && !updated.assetNumber && updated.amount > 5000) {
      const warning =
        "Wait, Rook! Check the asset tag box first. Sabine's rule: no asset tag, no capex booking.";
      setTutorFeedback({
        message: warning,
        type: 'warning',
        momentReplay: 'Sabine at 03:41: "No asset tag = don\'t touch it. Ask the controller."',
      });
      speakText(warning);
      return;
    }

    if (updates.status === 'approved' && updated.assetNumber && updated.currentCostCenter.includes('0400')) {
      const success = "Clean run! Invoice 4480 is approved and all of Sabine's rules were followed.";
      setTutorFeedback({
        message: success,
        type: 'success',
      });
      setMasteryScorecard((prev) => ({ ...prev, assetTagCheck: true }));
      speakText(success);
    }
  };

  const resetTeachMode = () => {
    setTeachInvoice(TEACH_MODE_INVOICE);
    setTutorFeedback(null);
    setMasteryScorecard({
      capexThreshold: false,
      assetTagCheck: false,
      decemberVendorCheck: false,
    });
  };

  return (
    <ApprenticeContext.Provider
      value={{
        mode,
        setMode,
        isCapturing,
        startCapture,
        stopCapture,
        isOffRecord,
        toggleOffRecord,
        piiShieldEnabled,
        togglePiiShield,
        mediaStream,
        videoRef,
        agentStatus,
        currentQuestion,
        dialogue,
        askAgentQuestion,
        submitExpertAnswer,
        events,
        recordScreenEvent,
        workMap,
        setWorkMap,
        isDebriefing,
        debriefQuestions,
        startDebrief,
        confirmWorkMap,
        teachInvoice,
        updateTeachInvoice,
        tutorFeedback,
        resetTeachMode,
        masteryScorecard,
      }}
    >
      {children}
    </ApprenticeContext.Provider>
  );
};

export const useApprentice = () => {
  const context = useContext(ApprenticeContext);
  if (!context) {
    throw new Error('useApprentice must be used within an ApprenticeProvider');
  }
  return context;
};

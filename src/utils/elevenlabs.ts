let currentAudio: HTMLAudioElement | null = null;
let currentResolve: (() => void) | null = null;
// Hold active utterance in module scope to prevent premature garbage collection in Chrome/WebKit
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: NodeJS.Timeout | null = null;

export async function speakText(
  text: string,
  options?: {
    persona?: 'apprentice' | 'sabine';
    voiceId?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<void> {
  stopSpeaking();

  return new Promise<void>(async (resolve) => {
    currentResolve = resolve;

    const cleanup = () => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      activeUtterance = null;
      options?.onEnd?.();
      if (currentResolve) {
        currentResolve();
        currentResolve = null;
      }
    };

    options?.onStart?.();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          persona: options?.persona || 'apprentice',
          voiceId: options?.voiceId,
        }),
      });

      const contentType = res.headers.get('content-type');

      if (res.ok && contentType && contentType.includes('audio/mpeg')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);

        currentAudio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudio = null;
          cleanup();
        };

        currentAudio.onerror = (e) => {
          console.warn('Audio playback notice, using browser speech fallback:', e);
          fallbackSpeech(text, options, cleanup);
        };

        await currentAudio.play();
        return;
      }

      // Fallback to browser speech synthesis
      fallbackSpeech(text, options, cleanup);
    } catch (err) {
      console.warn('TTS request error, using fallback:', err);
      fallbackSpeech(text, options, cleanup);
    }
  });
}

function fallbackSpeech(
  text: string,
  options?: {
    persona?: 'apprentice' | 'sabine';
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  },
  onDone?: () => void
) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Cancel any previous hung speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance; // Prevent premature GC in Chrome

    // Persona pitch & rate modulation
    if (options?.persona === 'sabine') {
      utterance.rate = 0.92;
      utterance.pitch = 0.9;
    } else {
      utterance.rate = 1.05;
      utterance.pitch = 1.05;
    }

    const voices = window.speechSynthesis.getVoices();
    const isGerman = /[äöüß]|Guten|Ausrüstung|Rechnung|immer/i.test(text);

    if (isGerman) {
      const deVoice = voices.find((v) => v.lang.startsWith('de'));
      if (deVoice) utterance.voice = deVoice;
    } else {
      const femaleVoices = voices.filter(
        (v) => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google')
      );
      if (options?.persona === 'sabine' && femaleVoices.length > 1) {
        utterance.voice = femaleVoices[1];
      } else if (femaleVoices[0]) {
        utterance.voice = femaleVoices[0];
      }
    }

    utterance.onend = () => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      activeUtterance = null;
      onDone?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      activeUtterance = null;
      options?.onError?.(e);
      onDone?.();
    };

    // Chromium pause/resume keep-alive to prevent speech synthesis pausing after ~4 seconds
    keepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
    }, 3500);

    window.speechSynthesis.speak(utterance);
  } else {
    onDone?.();
  }
}

export function stopSpeaking() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  activeUtterance = null;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentResolve) {
    currentResolve();
    currentResolve = null;
  }
}

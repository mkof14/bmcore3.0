import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, AlertCircle, Scale, Volume2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import TypingIndicator from './TypingIndicator';
import { supabase } from '../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../lib/adminNotify';
import { generateDualOpinion } from '../lib/dualOpinionEngine';
import DualOpinionView from './DualOpinionView';
import type { AssistantPersona } from '../types/database';
import type { Opinion, OpinionDiff, Recommendation } from '../lib/dualOpinionEngine';
import { getLanguageMeta, type AppLanguage } from '../i18n/languages';
import {
  detectAppLanguage,
  resolveFallbackLanguage,
  speechLangForAppLanguage,
} from '../lib/detectLanguage';
import { healthGuideDualSpeak, healthGuideReply } from '../lib/healthGuideReplies';
import {
  cancelHealthGuideSpeech,
  speakNaturally,
  warmUpSpeechVoices,
} from '../lib/healthGuideSpeech';
import {
  buildPersonalContext,
  type PersonalContext,
} from '../lib/personalContext';

interface BaseMessage {
  id: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface UserMessage extends BaseMessage {
  role: 'user';
  content: string;
}

interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  content: string;
  type?: undefined;
}

interface DualOpinionMessage extends BaseMessage {
  role: 'assistant';
  type: 'dual-opinion';
  opinionA: Opinion;
  opinionB: Opinion;
  diff: OpinionDiff;
}

interface SystemMessage extends BaseMessage {
  role: 'system';
  content: string;
}

type Message = UserMessage | AssistantMessage | DualOpinionMessage | SystemMessage;

interface AIHealthAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIHealthAssistant({ isOpen, onClose }: AIHealthAssistantProps) {
  const { t, i18n } = useTranslation();
  const [personas, setPersonas] = useState<AssistantPersona[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dualOpinionEnabled, setDualOpinionEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [micIntensity, setMicIntensity] = useState(0.2);
  const [interimSpeech, setInterimSpeech] = useState('');

  const uiLang = resolveFallbackLanguage(i18n.language);
  const [conversationLang, setConversationLang] = useState<AppLanguage>(uiLang);

  const personalContextRef = useRef<PersonalContext | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const micSessionRef = useRef(0);
  const isRecordingRef = useRef(false);
  const inputMessageRef = useRef('');
  const isSpeakerMutedRef = useRef(false);
  const conversationLangRef = useRef<AppLanguage>(uiLang);
  const handleSendMessageRef = useRef<() => void>(() => undefined);
  const startingMicRef = useRef(false);
  const baseTranscriptRef = useRef('');
  const stopRecordingRef = useRef<() => void>(() => undefined);
  const stopSpeechRef = useRef<() => void>(() => undefined);

  const applyConversationLang = useCallback((next: AppLanguage) => {
    conversationLangRef.current = next;
    setConversationLang(next);
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLangForAppLanguage(next);
    }
  }, []);

  useEffect(() => {
    // When user switches site language and hasn't spoken yet, follow UI language.
    applyConversationLang(uiLang);
  }, [uiLang, applyConversationLang]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    inputMessageRef.current = inputMessage;
  }, [inputMessage]);

  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
  }, [isSpeakerMuted]);

  useEffect(() => warmUpSpeechVoices(), []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const ctx = await buildPersonalContext(user.id);
        if (!cancelled) personalContextRef.current = ctx;
      } catch {
        if (!cancelled) personalContextRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addWelcomeMessage = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: t('healthGuide.welcome'),
      timestamp: new Date(),
      isTyping: false,
    }]);
  }, [t]);

  const stopSpeech = useCallback(() => {
    cancelHealthGuideSpeech();
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback((text: string, lang?: AppLanguage) => {
    if (isRecordingRef.current) return;
    const code = lang ?? conversationLangRef.current;
    speakNaturally(text, {
      lang: speechLangForAppLanguage(code),
      muted: isSpeakerMutedRef.current,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, []);

  const handleSendMessage = useCallback(async () => {
    const text = inputMessageRef.current.trim();
    if (!text || isLoading) return;

    const detected = detectAppLanguage(text, conversationLangRef.current);
    applyConversationLang(detected);

    const userMsg: UserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    inputMessageRef.current = '';
    setIsLoading(true);

    setTimeout(() => {
      if (dualOpinionEnabled && personas.length >= 2) {
        const personaA = personas.find((p) => p.reasoning_style === 'evidence_based') || personas[0];
        const personaB = personas.find((p) => p.reasoning_style === 'contextual') || personas[1];

        const { opinionA, opinionB, diff } = generateDualOpinion(
          userMsg.content,
          personaA,
          personaB,
        );

        const dualOpinionMsg: DualOpinionMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'dual-opinion',
          opinionA,
          opinionB,
          diff,
          timestamp: new Date(),
          isTyping: false,
        };

        setMessages((prev) => [...prev, dualOpinionMsg]);
        speakText(
          healthGuideDualSpeak(detected, opinionA.summary, opinionB.summary),
          detected,
        );
      } else {
        const ctx = personalContextRef.current;
        const response = healthGuideReply(userMsg.content, detected, {
          personalContextBlurb: ctx?.contextBlurb,
          systemPreface: ctx?.aiPayload.systemPreface,
        });

        const assistantMsg: AssistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          isTyping: true,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        // Speech is triggered after typing animation; browser SpeechSynthesis only.
      }

      setIsLoading(false);
    }, 800);
  }, [dualOpinionEnabled, personas, isLoading, speakText, applyConversationLang]);

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const stopLevelMeter = useCallback(() => {
    if (levelRafRef.current != null) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    micSessionRef.current += 1;
    startingMicRef.current = false;
    isRecordingRef.current = false;

    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognitionRef.current = null;
      try {
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {
          /* already stopped */
        }
      }
    }

    stopLevelMeter();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsRecording(false);
    setIsUserSpeaking(false);
    setMicIntensity(0.2);
    setInterimSpeech('');
    baseTranscriptRef.current = '';
  }, [stopLevelMeter]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    stopSpeechRef.current = stopSpeech;
  }, [stopSpeech]);

  const startLevelMeter = useCallback((analyser: AnalyserNode, session: number) => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (micSessionRef.current !== session) return;
      analyser.getByteFrequencyData(data);
      const band = data.slice(4, 84);
      const average = band.reduce((sum, value) => sum + value, 0) / band.length;
      const peak = Math.max(...band);
      const normalized = Math.min(1, (average * 0.65 + peak * 0.35) / 160);
      setMicIntensity(Math.max(0.15, normalized));
      setIsUserSpeaking(normalized > 0.22);
      levelRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const startRecording = useCallback(async () => {
    if (startingMicRef.current || isRecordingRef.current) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      notifyUserInfo(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
      );
      return;
    }

    if (!window.isSecureContext) {
      notifyUserError('Microphone needs HTTPS (or localhost). Open the site over a secure connection.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      notifyUserError('Microphone is not available in this browser.');
      return;
    }

    startingMicRef.current = true;
    stopSpeech();
    const session = micSessionRef.current + 1;
    micSessionRef.current = session;
    baseTranscriptRef.current = inputMessageRef.current;
    setInterimSpeech('');

    try {
      // Permission + level meter first.
      // Do NOT open a second getUserMedia after SpeechRecognition — that steals the mic.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (micSessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        if (micSessionRef.current !== session) {
          stream.getTracks().forEach((track) => track.stop());
          await audioContext.close().catch(() => undefined);
          return;
        }
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.72;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        startLevelMeter(analyser, session);
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLangForAppLanguage(conversationLangRef.current);
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (micSessionRef.current !== session) return;

        let finalChunk = '';
        let interim = '';
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const piece = result[0]?.transcript || '';
          if (!piece) continue;
          if (result.isFinal) finalChunk += `${piece} `;
          else interim += piece;
        }

        if (finalChunk.trim()) {
          const merged = `${baseTranscriptRef.current} ${finalChunk}`
            .replace(/\s+/g, ' ')
            .trim();
          baseTranscriptRef.current = merged;
          inputMessageRef.current = merged;
          setInputMessage(merged);
          setInterimSpeech('');
          const heardLang = detectAppLanguage(merged, conversationLangRef.current);
          if (heardLang !== conversationLangRef.current) {
            applyConversationLang(heardLang);
          }
        } else if (interim) {
          setInterimSpeech(interim);
          const live = `${baseTranscriptRef.current} ${interim}`.replace(/\s+/g, ' ').trim();
          inputMessageRef.current = live;
          setInputMessage(live);
        }

        silenceTimerRef.current = setTimeout(() => {
          if (micSessionRef.current !== session) return;
          setIsUserSpeaking(false);
          setMicIntensity(0.25);
          const text = (baseTranscriptRef.current || inputMessageRef.current).trim();
          if (text) {
            inputMessageRef.current = text;
            setInputMessage(text);
            stopRecordingRef.current();
            handleSendMessageRef.current();
          }
        }, 1600);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (micSessionRef.current !== session) return;
        if (event.error === 'aborted' || event.error === 'no-speech') return;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          notifyUserError(
            'Microphone access denied. Click the lock icon in the address bar and allow microphone.',
          );
          stopRecordingRef.current();
          return;
        }

        if (event.error === 'audio-capture') {
          notifyUserError('No microphone found, or it is already in use by another app.');
          stopRecordingRef.current();
          return;
        }

        if (event.error === 'network') {
          notifyUserError('Speech recognition needs an internet connection. Check your network and try again.');
          stopRecordingRef.current();
          return;
        }

        notifyUserError(`Speech recognition error: ${event.error}`);
        stopRecordingRef.current();
      };

      recognition.onend = () => {
        if (micSessionRef.current !== session || !isRecordingRef.current) return;
        try {
          recognition.start();
        } catch {
          /* ignore restart races */
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      if (micSessionRef.current !== session) return;

      isRecordingRef.current = true;
      setIsRecording(true);
      setMicIntensity(0.35);
    } catch (error) {
      if (micSessionRef.current !== session) return;
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        notifyUserError(
          'Microphone access denied. Click the lock icon in the address bar and allow microphone.',
        );
      } else if (name === 'NotFoundError') {
        notifyUserError('No microphone found on this device.');
      } else {
        const message =
          error instanceof Error ? error.message : 'Could not start microphone';
        notifyUserError(message);
      }
      stopRecordingRef.current();
    } finally {
      startingMicRef.current = false;
    }
  }, [startLevelMeter, stopSpeech, applyConversationLang]);

  const toggleRecording = useCallback(() => {
    if (isRecordingRef.current || startingMicRef.current) {
      stopRecording();
      return;
    }
    void startRecording();
  }, [startRecording, stopRecording]);

  useEffect(() => {
    if (!isOpen) return;
    const loadPersonas = async () => {
      const { data } = await supabase
        .from('assistant_personas')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      if (data) setPersonas(data);
    };
    loadPersonas();
    addWelcomeMessage();
  }, [isOpen, addWelcomeMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      stopRecordingRef.current();
      stopSpeechRef.current();
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      stopRecordingRef.current();
      stopSpeechRef.current();
    },
    [],
  );

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLangForAppLanguage(conversationLang);
    }
  }, [conversationLang]);

  const toggleSpeaker = () => {
    const nextMuted = !isSpeakerMuted;
    setIsSpeakerMuted(nextMuted);
    isSpeakerMutedRef.current = nextMuted;
    if (nextMuted) stopSpeech();
  };

  const handleMerge = (preference: 'A' | 'B' | 'merge') => {
    const confirmMsg: SystemMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `You've adopted ${preference === 'merge' ? 'the merged' : `Opinion ${preference}`} approach. Your preferences have been saved.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  const handleCreateReport = () => {
    const confirmMsg: SystemMessage = {
      id: Date.now().toString(),
      role: 'system',
      content:
        'Report generation feature coming soon! This will create a detailed health report based on our conversation.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  const handleAddGoals = (recommendations: Recommendation[]) => {
    const confirmMsg: SystemMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: `Goal creation feature coming soon! ${recommendations.length} recommendations will be converted into trackable goals.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/25 dark:bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-x-3 bottom-[4.75rem] z-50 flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-20">
        <div className="pointer-events-auto flex h-[min(55vh,494px)] w-full max-w-[28.5rem] flex-col overflow-hidden border border-[var(--bm-border)] bg-page shadow-xl sm:h-[min(60vh,546px)] sm:max-w-[31rem]">
          <div className="border-b border-[var(--bm-border)] bg-[var(--bm-surface)] px-3.5 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden border border-[var(--bm-border)] bg-page">
                  <img
                    src="/health-guide-avatar.webp"
                    alt=""
                    width={128}
                    height={128}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
                    BioMath Core
                  </p>
                  <h3 className="truncate text-sm font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    {t('healthGuide.name')}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-neutral-100"
                aria-label={t('common.close')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Mic
                    className={`h-3.5 w-3.5 ${
                      isUserSpeaking || isRecording ? 'text-orange-500' : 'text-gray-400'
                    } ${isUserSpeaking ? 'animate-pulse' : ''}`}
                  />
                  <AudioVisualizer
                    isActive={isRecording}
                    type="microphone"
                    intensity={micIntensity}
                  />
                  <button
                    type="button"
                    onClick={toggleSpeaker}
                    className="relative"
                    title={isSpeakerMuted ? 'Unmute voice' : 'Mute voice'}
                    aria-pressed={isSpeakerMuted}
                  >
                    {isSpeakerMuted ? (
                      <div className="relative">
                        <Volume2 className="h-3.5 w-3.5 text-gray-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-px w-4 rotate-45 bg-orange-500" />
                        </div>
                      </div>
                    ) : (
                      <Volume2
                        className={`h-3.5 w-3.5 ${isSpeaking ? 'text-orange-500' : 'text-gray-400'}`}
                      />
                    )}
                  </button>
                  <AudioVisualizer
                    isActive={isSpeaking && !isSpeakerMuted}
                    type="speaker"
                    intensity={isSpeaking ? 0.75 : 0.2}
                  />
                </div>
                <span className="hidden truncate text-[10px] text-gray-500 dark:text-neutral-500 sm:inline">
                  {t('healthGuide.disclaimer')}
                  {' · '}
                  {t('healthGuide.detectedLang', {
                    lang: getLanguageMeta(conversationLang).nativeLabel,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDualOpinionEnabled(!dualOpinionEnabled)}
                className={`inline-flex flex-shrink-0 items-center gap-1 border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                  dualOpinionEnabled
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-[var(--bm-border)] bg-page text-gray-600 hover:border-orange-500/40 dark:text-neutral-300'
                }`}
              >
                <Scale className="h-3 w-3" />
                {t('healthGuide.secondOpinion')}
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-page px-3 py-3">
            {messages.map((message) => {
              if ('type' in message && message.type === 'dual-opinion') {
                return (
                  <div key={message.id} className="w-full">
                    <div className="mb-2 inline-flex items-center gap-1.5 border-t border-orange-500/50 pt-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                        {t('healthGuide.dualAnalysis')}
                      </span>
                    </div>
                    <DualOpinionView
                      opinionA={message.opinionA}
                      opinionB={message.opinionB}
                      diff={message.diff}
                      onMerge={handleMerge}
                      onCreateReport={handleCreateReport}
                      onAddGoals={handleAddGoals}
                    />
                  </div>
                );
              }

              const isUser = message.role === 'user';
              const isSystem = message.role === 'system';

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <p className="max-w-[90%] border-l-2 border-orange-500/50 pl-2 text-center text-[11px] leading-relaxed text-gray-600 dark:text-neutral-400">
                      {message.content}
                    </p>
                  </div>
                );
              }

              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 text-[12px] leading-relaxed ${
                      isUser
                        ? 'bg-orange-500 text-white'
                        : 'border border-[var(--bm-border)] bg-[var(--bm-surface)] text-gray-900 dark:text-neutral-100'
                    }`}
                  >
                    {message.isTyping ? (
                      <TypingIndicator
                        text={(message as AssistantMessage).content}
                        speed={30}
                        onComplete={() => {
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === message.id ? { ...msg, isTyping: false } : msg,
                            ),
                          );
                          speakText((message as AssistantMessage).content);
                        }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 border border-[var(--bm-border)] bg-[var(--bm-surface)] px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '0ms' }} />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '150ms' }} />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '300ms' }} />
                  </div>
                  {dualOpinionEnabled && (
                    <span className="text-[10px] text-gray-500 dark:text-neutral-500">
                      {t('healthGuide.analyzing')}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--bm-border)] bg-[var(--bm-surface)] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                className={`relative border p-2 transition-colors ${
                  isRecording
                    ? 'border-orange-500/50 text-orange-500'
                    : 'border-[var(--bm-border)] text-gray-500 hover:border-orange-500/40 hover:text-orange-500'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
                aria-pressed={isRecording}
              >
                <Mic className={`h-3.5 w-3.5 ${isUserSpeaking ? 'animate-pulse' : ''}`} />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder={
                  isRecording
                    ? interimSpeech
                      ? 'Listening…'
                      : 'Listening — speak now…'
                    : dualOpinionEnabled
                      ? t('healthGuide.askDual')
                      : t('healthGuide.askAnything')
                }
                className="min-w-0 flex-1 border border-[var(--bm-border)] bg-page px-2.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-orange-500/50 focus:outline-none dark:text-neutral-100"
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-orange-500 p-2 text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            {dualOpinionEnabled && (
              <p className="mt-1.5 flex items-start gap-1 text-[10px] leading-snug text-gray-500 dark:text-neutral-500">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-500" />
                <span>{t('healthGuide.dualModeHint')}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

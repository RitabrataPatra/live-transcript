import { useState, useEffect, useRef, useCallback } from 'react';
import { TranscriptSegment } from '../types';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface UseSpeechRecognitionProps {
  languageCode: string;
  onFinalTranscript?: (chunk: string, fullSegment: TranscriptSegment) => void;
}

export function useSpeechRecognition({
  languageCode,
  onFinalTranscript,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef<boolean>(false);
  const languageRef = useRef<string>(languageCode);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const restartTimeoutRef = useRef<number | null>(null);

  // Keep references updated
  useEffect(() => {
    languageRef.current = languageCode;
    if (recognitionRef.current && isListening) {
      // Re-apply language if recognition is live
      try {
        recognitionRef.current.lang = languageCode;
      } catch (e) {
        console.warn('Could not update recognition language on the fly', e);
      }
    }
  }, [languageCode, isListening]);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Check support on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.'
      );
    }
  }, []);

  const createRecognitionInstance = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return null;

    try {
      const recognition = new SpeechRecognitionAPI();
      // On mobile Safari and Android Chrome, continuous=true can cause glitchy aborts
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = languageRef.current;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalizedChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0]?.transcript || '';

          if (result.isFinal) {
            finalizedChunk += transcriptText;
          } else {
            interim += transcriptText;
          }
        }

        setInterimText(interim);

        if (finalizedChunk.trim()) {
          const now = Date.now();
          const start = sessionStartTime || now;
          const segment: TranscriptSegment = {
            id: `seg_${now}_${Math.random().toString(36).substring(2, 6)}`,
            text: finalizedChunk.trim(),
            timestamp: now - start,
            isFinal: true,
          };

          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(finalizedChunk.trim(), segment);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition event error:', event.error);
        if (event.error === 'no-speech') {
          // Expected during silence intervals, keep listening
          return;
        }
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
          shouldListenRef.current = false;
          setIsListening(false);
        } else if (event.error === 'network') {
          // On mobile, network error often fires on temporary server disconnect
          console.warn('Mobile speech network error, will attempt graceful retry');
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Speech recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setInterimText('');
        // If user wants to keep listening, auto-restart safely
        if (shouldListenRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          const delay = isMobile ? 350 : 150;
          restartTimeoutRef.current = window.setTimeout(() => {
            if (shouldListenRef.current) {
              try {
                const newInstance = createRecognitionInstance();
                if (newInstance) {
                  recognitionRef.current = newInstance;
                  newInstance.start();
                }
              } catch (err: any) {
                console.warn('Speech restart note:', err);
              }
            }
          }, delay);
        } else {
          setIsListening(false);
        }
      };

      return recognition;
    } catch (err) {
      console.error('Failed to initialize SpeechRecognition', err);
      setErrorMessage('Failed to initialize speech recognition engine.');
      return null;
    }
  }, [sessionStartTime]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    shouldListenRef.current = true;
    setInterimText('');

    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      const instance = createRecognitionInstance();
      if (instance) {
        recognitionRef.current = instance;
        instance.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
      // If already started, ignore error
      if (err.name !== 'InvalidStateError') {
        setErrorMessage('Could not start microphone listening: ' + (err.message || 'Unknown error'));
        shouldListenRef.current = false;
        setIsListening(false);
      }
    }
  }, [createRecognitionInstance, sessionStartTime]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    setInterimText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    interimText,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setErrorMessage(null),
    resetSessionTimer: () => setSessionStartTime(Date.now()),
  };
}

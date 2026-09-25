import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptSegment } from '../types';

interface UseGeminiTranscribeProps {
  languageCode: string;
  languageName: string;
  onTranscriptSegment: (text: string, segment: TranscriptSegment) => void;
}

export function useGeminiTranscribe({
  languageCode,
  languageName,
  onTranscriptSegment,
}: UseGeminiTranscribeProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef<boolean>(false);
  const sessionStartRef = useRef<number>(Date.now());
  const intervalTimerRef = useRef<number | null>(null);

  const languageNameRef = useRef(languageName);
  const languageCodeRef = useRef(languageCode);
  const onTranscriptSegmentRef = useRef(onTranscriptSegment);

  useEffect(() => {
    languageNameRef.current = languageName;
    languageCodeRef.current = languageCode;
  }, [languageName, languageCode]);

  useEffect(() => {
    onTranscriptSegmentRef.current = onTranscriptSegment;
  }, [onTranscriptSegment]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAudioChunk = async (blob: Blob) => {
    if (!blob || blob.size < 1000) {
      // Too small / likely silence
      return;
    }

    try {
      setIsProcessing(true);
      const base64Data = await blobToBase64(blob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: blob.type || 'audio/webm',
          languageCode: languageCodeRef.current,
          languageName: languageNameRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      const text = (result.text || '').trim();

      if (text) {
        const now = Date.now();
        const segment: TranscriptSegment = {
          id: `gemini_seg_${now}_${Math.random().toString(36).substring(2, 6)}`,
          text: text,
          timestamp: now - sessionStartRef.current,
          isFinal: true,
        };
        onTranscriptSegmentRef.current(text, segment);
      }
    } catch (err: any) {
      console.warn('Gemini audio transcription warning:', err);
      // Only set error if not unmounted
      if (isRecordingRef.current) {
        setErrorMessage(err.message || 'Failed to transcribe audio chunk');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecorder = useCallback((stream: MediaStream) => {
    try {
      setErrorMessage(null);
      isRecordingRef.current = true;
      sessionStartRef.current = Date.now();
      audioChunksRef.current = [];

      // Determine best audio mimeType supported by mobile browser
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const startSegmentRecording = () => {
        if (!isRecordingRef.current) return;
        try {
          const recorder = new MediaRecorder(
            stream,
            selectedMimeType ? { mimeType: selectedMimeType } : undefined
          );
          const localChunks: Blob[] = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              localChunks.push(e.data);
            }
          };

          recorder.onstop = () => {
            if (localChunks.length > 0) {
              const chunkBlob = new Blob(localChunks, {
                type: selectedMimeType || 'audio/webm',
              });
              processAudioChunk(chunkBlob);
            }

            // If still actively recording, restart next segment immediately
            if (isRecordingRef.current) {
              startSegmentRecording();
            }
          };

          mediaRecorderRef.current = recorder;
          recorder.start();

          // Stop this chunk after 3.8 seconds to trigger onstop with valid container header
          intervalTimerRef.current = window.setTimeout(() => {
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }, 3800);
        } catch (err: any) {
          console.error('Segment recording error:', err);
        }
      };

      startSegmentRecording();
    } catch (err: any) {
      console.error('Failed to start Gemini MediaRecorder:', err);
      setErrorMessage(err.message || 'Could not record microphone audio');
    }
  }, []);

  const stopRecorder = useCallback(async () => {
    isRecordingRef.current = false;

    if (intervalTimerRef.current) {
      clearTimeout(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
  }, []);

  // One-off direct audio file transcription
  const transcribeAudioBlob = async (blob: Blob): Promise<string> => {
    try {
      setIsProcessing(true);
      const base64Data = await blobToBase64(blob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: blob.type || 'audio/webm',
          languageCode: languageCodeRef.current,
          languageName: languageNameRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      return (result.text || '').trim();
    } catch (err: any) {
      console.error('transcribeAudioBlob error:', err);
      setErrorMessage(err.message || 'Failed to transcribe audio file');
      return '';
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, []);

  return {
    isProcessing,
    errorMessage,
    startRecorder,
    stopRecorder,
    transcribeAudioBlob,
    clearError: () => setErrorMessage(null),
  };
}

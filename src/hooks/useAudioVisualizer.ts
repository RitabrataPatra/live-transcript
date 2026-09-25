import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioVisualizerHook {
  audioStream: MediaStream | null;
  audioLevel: number; // 0 to 100
  startAudioContext: () => Promise<MediaStream | null>;
  stopAudioContext: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecordingAudio: boolean;
  recordedAudioUrl: string | null;
  startMediaRecorder: () => void;
  stopMediaRecorder: () => void;
  hasAudioPermission: boolean;
  permissionError: string | null;
}

export function useAudioVisualizer(isActive: boolean): AudioVisualizerHook {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startAudioContext = useCallback(async (): Promise<MediaStream | null> => {
    try {
      if (streamRef.current && streamRef.current.active) {
        return streamRef.current;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setHasAudioPermission(true);
      setPermissionError(null);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      return stream;
    } catch (err: unknown) {
      console.warn('Microphone stream access error:', err);
      const errMsg = err instanceof Error ? err.message : 'Microphone access denied';
      setPermissionError(errMsg);
      setHasAudioPermission(false);
      return null;
    }
  }, []);

  const stopAudioContext = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startMediaRecorder = useCallback(() => {
    if (!streamRef.current || !streamRef.current.active) return;
    try {
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setIsRecordingAudio(false);
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecordingAudio(true);
    } catch (err) {
      console.error('MediaRecorder error:', err);
    }
  }, []);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Visualizer render loop
  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      if (!analyser || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Compute average volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));
      setAudioLevel(normalizedLevel);

      // Render smooth waveform bars
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 18;
      const barWidth = Math.max(2, (width / barCount) - 3);
      const step = Math.floor(bufferLength / barCount) || 1;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.min(i * step, bufferLength - 1);
        const value = dataArray[dataIndex] || 0;
        const percent = value / 255;
        const barHeight = Math.max(3, percent * (height - 4));
        const x = i * (barWidth + 3) + 2;
        const y = (height - barHeight) / 2;

        // Gradient from Google blue to cyan/emerald
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#60a5fa');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  return {
    audioStream: streamRef.current,
    audioLevel,
    startAudioContext,
    stopAudioContext,
    canvasRef,
    isRecordingAudio,
    recordedAudioUrl,
    startMediaRecorder,
    stopMediaRecorder,
    hasAudioPermission,
    permissionError,
  };
}

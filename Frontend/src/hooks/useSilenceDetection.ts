import { useRef, useCallback, useState } from "react";

interface UseSilenceDetectionReturn {
  startDetection: (stream: MediaStream, onSilence: () => void) => void;
  stopDetection: () => void;
  isDetecting: boolean;
}

const SILENCE_THRESHOLD = 0.02;
const SILENCE_DURATION_MS = 2000;

export function useSilenceDetection(): UseSilenceDetectionReturn {
  const [isDetecting, setIsDetecting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const calculateRMS = useCallback((dataArray: Uint8Array): number => {
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      // Convert to -1 to 1 range
      const normalized = (dataArray[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    return Math.sqrt(sumSquares / dataArray.length);
  }, []);

  const startDetection = useCallback((stream: MediaStream, onSilence: () => void) => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Connect stream to analyser
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsDetecting(true);

      const checkAudioLevel = () => {
        if (!analyserRef.current || !isDetecting) return;

        analyserRef.current.getByteTimeDomainData(dataArray);
        const rms = calculateRMS(dataArray);

        if (rms < SILENCE_THRESHOLD) {
          // Below threshold - start or continue silence timer
          if (silenceStartRef.current === null) {
            silenceStartRef.current = Date.now();
          } else if (Date.now() - silenceStartRef.current >= SILENCE_DURATION_MS) {
            // Silence detected for required duration
            onSilence();
            silenceStartRef.current = null;
            return; // Stop detection after triggering
          }
        } else {
          // Above threshold - reset silence timer
          silenceStartRef.current = null;
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error("Failed to start silence detection:", error);
    }
  }, [calculateRMS, isDetecting]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    silenceStartRef.current = null;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  return {
    startDetection,
    stopDetection,
    isDetecting,
  };
}

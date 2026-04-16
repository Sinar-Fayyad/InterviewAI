import { useState, useRef, useCallback } from "react";
import toWav from "audiobuffer-to-wav";

interface UseAudioRecorderReturn {
  startAudioRecording: (stream: MediaStream) => void;
  stopAudioRecording: () => Promise<File | null>;
  isRecording: boolean;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const convertTo16kHzMono = async (audioBlob: Blob): Promise<File> => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create a new mono buffer at 16kHz
      const offlineContext = new OfflineAudioContext(
        1, // mono
        Math.ceil(audioBuffer.duration * 16000),
        16000
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      const renderedBuffer = await offlineContext.startRendering();
      const wavBuffer = toWav(renderedBuffer);
      
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
      const file = new File([wavBlob], `answer_${Date.now()}.wav`, {
        type: "audio/wav",
      });

      return file;
    } finally {
      audioContext.close();
    }
  };

  const startAudioRecording = useCallback((stream: MediaStream) => {
    chunksRef.current = [];
    streamRef.current = stream;

    // Create audio-only stream
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error("No audio tracks available");
      return;
    }

    const audioStream = new MediaStream(audioTracks);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const mediaRecorder = new MediaRecorder(audioStream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100); // Collect data every 100ms
    setIsRecording(true);
  }, []);

  const stopAudioRecording = useCallback(async (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);

        if (chunksRef.current.length === 0) {
          resolve(null);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        try {
          const wavFile = await convertTo16kHzMono(audioBlob);
          resolve(wavFile);
        } catch (error) {
          console.error("Failed to convert audio:", error);
          // Fallback: return the original webm as a file
          const file = new File([audioBlob], `answer_${Date.now()}.webm`, {
            type: "audio/webm",
          });
          resolve(file);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    startAudioRecording,
    stopAudioRecording,
    isRecording,
  };
}

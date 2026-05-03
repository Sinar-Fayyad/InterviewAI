/// <reference types="dom-speech-recognition" />
import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechRecognitionReturn {
  startListening: () => void;
  stopListening: () => Promise<string>;
  isListening: boolean;
  interimTranscript: string;
  isSupported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const resolveRef = useRef<((text: string) => void) | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    finalTranscriptRef.current = "";
    setInterimTranscript("");

    const SpeechRecognitionAPI =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech") {
        console.error("SpeechRecognition error:", event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      const finalText = finalTranscriptRef.current.trim();
      if (resolveRef.current) {
        resolveRef.current(finalText);
        resolveRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!recognitionRef.current) {
        resolve("");
        return;
      }
      resolveRef.current = resolve;
      recognitionRef.current.stop();
    });
  }, []);

  return { startListening, stopListening, isListening, interimTranscript, isSupported };
}
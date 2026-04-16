import { useRef, useCallback, useState, useEffect } from "react";
import * as faceapi from "face-api.js";

interface UseFaceEmotionReturn {
  initializeFaceApi: () => Promise<boolean>;
  startEmotionDetection: (videoElement: HTMLVideoElement) => void;
  stopEmotionDetection: () => void;
  getCurrentEmotion: () => string;
  isModelLoaded: boolean;
  isDetecting: boolean;
}

const DETECTION_INTERVAL_MS = 500;

export function useFaceEmotion(): UseFaceEmotionReturn {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const currentEmotionRef = useRef<string>("neutral");
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const initializeFaceApi = useCallback(async (): Promise<boolean> => {
    try {
      // Load models from CDN
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      
      setIsModelLoaded(true);
      console.log("Face-api.js models loaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to load face-api.js models:", error);
      return false;
    }
  }, []);

  const detectEmotion = useCallback(async () => {
    if (!videoElementRef.current || !isModelLoaded) return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoElementRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection && detection.expressions) {
        // Find the emotion with highest confidence
        const expressions = detection.expressions;
        let maxEmotion = "neutral";
        let maxValue = 0;

        // Access expression values directly
        const emotionMap: Record<string, number> = {
          neutral: expressions.neutral,
          happy: expressions.happy,
          sad: expressions.sad,
          angry: expressions.angry,
          fearful: expressions.fearful,
          disgusted: expressions.disgusted,
          surprised: expressions.surprised,
        };

        for (const [emotion, value] of Object.entries(emotionMap)) {
          if (value > maxValue) {
            maxValue = value;
            maxEmotion = emotion;
          }
        }

        currentEmotionRef.current = maxEmotion;
      }
    } catch (error) {
      // Silently ignore detection errors
    }
  }, [isModelLoaded]);

  const startEmotionDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (!isModelLoaded) {
      console.warn("Face-api models not loaded yet");
      return;
    }

    videoElementRef.current = videoElement;
    setIsDetecting(true);

    // Start periodic detection
    detectionIntervalRef.current = setInterval(detectEmotion, DETECTION_INTERVAL_MS);
  }, [isModelLoaded, detectEmotion]);

  const stopEmotionDetection = useCallback(() => {
    setIsDetecting(false);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    videoElementRef.current = null;
  }, []);

  const getCurrentEmotion = useCallback((): string => {
    return currentEmotionRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    initializeFaceApi,
    startEmotionDetection,
    stopEmotionDetection,
    getCurrentEmotion,
    isModelLoaded,
    isDetecting,
  };
}

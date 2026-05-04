import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2, AlertCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useFaceEmotion } from "@/hooks/useFaceEmotion";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSilenceDetection } from "@/hooks/useSilenceDetection";
import { InterviewMode } from "@/components/interview/InterviewMode";
import { startInterview, submitAnswer } from "@/services/interviewService";

interface LocationState {
  companyName?: string;
  jobTitle?: string;
  contextSummary?: string;
}

const ALLOWED_EMOTIONS = [
  "happy", "sad", "neutral", "excited", "anxious",
  "angry", "fearful", "disgusted", "surprised",
];

const getSafeEmotion = (emotion: string): string => {
  return ALLOWED_EMOTIONS.includes(emotion) ? emotion : "neutral";
};

export default function MockInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { userId } = useAuth();

  const companyName = state?.companyName || "";
  const jobTitle = state?.jobTitle || "";
  const contextSummary = state?.contextSummary || "";

  const { isRecording, stream, videoRef, startRecording, stopRecording, error: mediaError } = useMediaRecorder();
  const { initializeFaceApi, startEmotionDetection, stopEmotionDetection, getCurrentEmotion, isModelLoaded } = useFaceEmotion();
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  const { startDetection, stopDetection } = useSilenceDetection();
  const {
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    isListening: isSpeechListening,
    interimTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();

  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitAnswerRef = useRef<(endNow?: boolean) => Promise<void>>();
  const interviewIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { interviewIdRef.current = interviewId; }, [interviewId]);
  useEffect(() => { streamRef.current = stream; }, [stream]);
  useEffect(() => { initializeFaceApi(); }, [initializeFaceApi]);

  // Timer
  useEffect(() => {
    if (isRecording && sessionStarted) {
      timerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, sessionStarted]);

  // Re-attach stream to video element when InterviewMode mounts
  useEffect(() => {
    if (sessionStarted && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [sessionStarted, stream, videoRef]);

  const startListening = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return;

    setIsListening(true);
    startSpeechRecognition();

    setTimeout(() => {
      startDetection(currentStream, () => {
        submitAnswerRef.current?.(false);
      });
    }, 1500);
  }, [startSpeechRecognition, startDetection]);

  const playQuestionAndListen = useCallback(async (question: string) => {
    try {
      await speak(question);
    } catch {
      // TTS failed, continue anyway
    }
    await new Promise((r) => setTimeout(r, 500));
    startListening();
  }, [speak, startListening]);

  const handleInterviewComplete = useCallback(async () => {
    stopDetection();
    stopEmotionDetection();
    stopSpeaking();
    setIsListening(false);
    setSessionStarted(false);

    const blob = await stopRecording();

    navigate(`/save-interview?id=${interviewIdRef.current}`, {
      state: {
        videoBlob: blob,
        interviewId: interviewIdRef.current,
        companyName,
        jobTitle,
        duration: elapsedTime,
      },
    });
  }, [
    companyName, jobTitle, elapsedTime, navigate,
    stopDetection, stopEmotionDetection, stopSpeaking, stopRecording,
  ]);

  const handleAnswerSubmit = useCallback(async (endNow: boolean = false) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsListening(false);
    stopDetection();

    try {
      const answerText = await stopSpeechRecognition();

      // No answer detected — speak goodbye then end
      if (!answerText && !endNow) {
        await speak("Okay, let's stop here for today. Thank you for your time!");
        await submitAnswer(interviewIdRef.current!, {
          answer_text: "",
          emotion: getSafeEmotion(getCurrentEmotion()),
          end_now: 1,
        });
        await handleInterviewComplete();
        return;
      }

      const emotion = getSafeEmotion(getCurrentEmotion());

      const data = await submitAnswer(interviewIdRef.current!, {
        answer_text: answerText || "",
        emotion,
        end_now: endNow ? 1 : 0,
      });

      // Interview finished (10 questions done)
      if (data?.finished) {
        await speak("That's all for today. Thank you so much for your time. We'll be in touch soon!");
        await handleInterviewComplete();
        return;
      }

      if (endNow) {
        await handleInterviewComplete();
        return;
      }

      const nextQuestion = data?.question;
      if (!nextQuestion) {
        throw new Error("No question received from server.");
      }

      setCurrentQuestion(nextQuestion);
      await playQuestionAndListen(nextQuestion);
    } catch (error: any) {
      console.error("Error submitting answer:", error);

      toast({
        title: "Connection Error",
        description: "Saving your interview progress...",
        variant: "destructive",
      });

      try {
        if (interviewIdRef.current) {
          await submitAnswer(interviewIdRef.current, {
            answer_text: "",
            emotion: getSafeEmotion(getCurrentEmotion()),
            end_now: 1,
          });
        }
      } catch {
        // Ignore secondary error
      }

      await handleInterviewComplete();
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing, stopDetection, stopSpeechRecognition, speak,
    getCurrentEmotion, handleInterviewComplete, playQuestionAndListen, toast,
  ]);

  useEffect(() => {
    submitAnswerRef.current = handleAnswerSubmit;
  }, [handleAnswerSubmit]);

  const handleEndInterview = useCallback(async () => {
    if (isProcessing) return;
    setIsListening(false);
    stopDetection();
    stopSpeaking();
    setIsProcessing(true);

    try {
      const answerText = await stopSpeechRecognition();

      // Speak goodbye before ending
      await speak("Alright, let's stop here. It was great speaking with you, see you next time!");

      if (interviewIdRef.current) {
        await submitAnswer(interviewIdRef.current, {
          answer_text: answerText || "",
          emotion: getSafeEmotion(getCurrentEmotion()),
          end_now: 1,
        });
      }
    } catch (error) {
      console.error("Error ending interview:", error);
    } finally {
      setIsProcessing(false);
    }

    await handleInterviewComplete();
  }, [
    isProcessing, stopDetection, stopSpeaking, stopSpeechRecognition,
    speak, getCurrentEmotion, handleInterviewComplete,
  ]);

  const handleStart = async () => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "Please log in to start an interview.",
        variant: "destructive",
      });
      return;
    }

    if (!isSpeechSupported) {
      toast({
        title: "Browser Not Supported",
        description: "Please use Chrome or Edge for speech recognition.",
        variant: "destructive",
      });
      return;
    }

    setIsStarting(true);

    try {
      const data = await startInterview(userId, {
        company_name: companyName,
        job_title: jobTitle,
        context_summary: contextSummary,
      });

      const createdId = data?.id || data?.interview_id;
      const firstQuestion = data?.message || data?.question;

      if (!createdId || !firstQuestion) {
        throw new Error("Invalid response from server.");
      }

      await startRecording();

      setInterviewId(createdId);
      setCurrentQuestion(firstQuestion);

      if (videoRef.current && isModelLoaded) {
        startEmotionDetection(videoRef.current);
      }

      setElapsedTime(0);
      setSessionStarted(true);

      toast({
        title: "Interview Started",
        description: "Recording has begun. Good luck!",
      });

      await playQuestionAndListen(firstQuestion);
    } catch (error) {
      console.error("Error starting interview:", error);
      await stopRecording();
      toast({
        title: "Failed to Start",
        description: "Could not connect to the interview server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (sessionStarted && isRecording) {
    return (
      <ProtectedRoute>
        <InterviewMode
          currentQuestion={currentQuestion}
          isRecording={isRecording}
          elapsedTime={elapsedTime}
          videoRef={videoRef}
          stream={stream}
          onEndInterview={handleEndInterview}
          isSpeaking={isSpeaking}
          isListening={isListening}
          interimTranscript={interimTranscript}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {mediaError && (
            <Card className="border-destructive bg-destructive/10 p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Camera/Microphone Access Required</p>
                  <p className="text-sm text-muted-foreground">{mediaError}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-secondary/80 border-primary/20 shadow-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold mb-4">
              {companyName && jobTitle ? `${jobTitle} at ${companyName}` : "Mock Interview"}
            </h1>

            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The AI will ask you questions and analyze your responses in real-time.
              The interview will be recorded for feedback.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold mb-2">Before you start:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Find a quiet, well-lit space</li>
                <li>• Position your camera at eye level</li>
                <li>• Speak clearly when answering questions</li>
                <li>• The AI will detect when you finish speaking</li>
              </ul>
            </div>

            {!isModelLoaded && (
              <div className="mb-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading face detection models...
              </div>
            )}

            <Button
              variant="hero"
              size="lg"
              onClick={handleStart}
              disabled={isStarting}
              className="px-12"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Interview
                </>
              )}
            </Button>

            <Button variant="ghost" className="mt-4 block mx-auto" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
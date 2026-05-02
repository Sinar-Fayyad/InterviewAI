import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2, AlertCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useSilenceDetection } from "@/hooks/useSilenceDetection";
import { useFaceEmotion } from "@/hooks/useFaceEmotion";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { InterviewMode } from "@/components/interview/InterviewMode";
import {
  startInterview,
  submitAnswer,
  endInterview,
} from "@/services/interviewService";

interface LocationState {
  companyName?: string;
  jobTitle?: string;
  contextSummary?: string;
  interviewId?: string | null;
  previewMode?: boolean;
}

export default function MockInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { userId } = useAuth();

  const companyName = state?.companyName || "";
  const jobTitle = state?.jobTitle || "";
  const contextSummary = state?.contextSummary || "";
  const initialInterviewId = state?.interviewId || null;

  // This makes the page work even when backend interview creation failed.
  const previewMode = state?.previewMode === true || !initialInterviewId;

  const {
    isRecording,
    stream,
    videoRef,
    startRecording,
    stopRecording,
    error: mediaError,
  } = useMediaRecorder();

  const { startDetection, stopDetection } = useSilenceDetection();

  const {
    initializeFaceApi,
    startEmotionDetection,
    stopEmotionDetection,
    getCurrentEmotion,
    isModelLoaded,
  } = useFaceEmotion();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
  } = useTextToSpeech();

  const {
    startAudioRecording,
    stopAudioRecording,
  } = useAudioRecorder();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [interviewId, setInterviewId] = useState<string | null>(initialInterviewId);
  const [isStarting, setIsStarting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const submitAnswerRef = useRef<(endNow?: boolean) => Promise<void>>();

  const previewQuestions = [
    `Tell me about yourself and why you are interested in the ${jobTitle || "role"}.`,
    `What skills make you a good fit for ${companyName || "this company"}?`,
    "Describe a challenge you faced and how you handled it.",
    "What are your strengths and weaknesses?",
    "Why should we hire you?",
  ];

  const previewQuestionIndexRef = useRef(0);

  const getNextPreviewQuestion = () => {
    const question =
      previewQuestions[previewQuestionIndexRef.current] ||
      "Thank you. That completes the preview interview.";

    previewQuestionIndexRef.current += 1;
    return question;
  };

  useEffect(() => {
    initializeFaceApi();
  }, [initializeFaceApi]);

  useEffect(() => {
    if (isRecording && sessionStarted) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, sessionStarted]);

  const startListening = useCallback(() => {
    if (!stream) return;

    setIsListening(true);
    startAudioRecording(stream);

    startDetection(stream, () => {
      submitAnswerRef.current?.(false);
    });
  }, [stream, startAudioRecording, startDetection]);

  const playQuestionAndListen = useCallback(
    async (question: string) => {
      try {
        await speak(question);
        startListening();
      } catch (error) {
        console.error("Text-to-speech failed:", error);
        startListening();
      }
    },
    [speak, startListening]
  );

  const handleInterviewComplete = useCallback(async () => {
    stopDetection();
    stopEmotionDetection();
    stopSpeaking();

    const blob = await stopRecording();
    recordedBlobRef.current = blob;
    setSessionStarted(false);

    if (previewMode || !interviewId) {
      toast({
        title: "Preview Interview Ended",
        description: "Backend saving is skipped because this is preview mode.",
      });

      navigate("/prepare");
      return;
    }

    navigate(`/save-interview?id=${interviewId}`, {
      state: {
        videoBlob: blob,
        interviewId,
        companyName,
        jobTitle,
        duration: elapsedTime,
      },
    });
  }, [
    previewMode,
    interviewId,
    companyName,
    jobTitle,
    elapsedTime,
    navigate,
    stopDetection,
    stopEmotionDetection,
    stopSpeaking,
    stopRecording,
    toast,
  ]);

  const handleAnswerSubmit = useCallback(
    async (endNow: boolean = false) => {
      if (isProcessing) return;

      setIsProcessing(true);
      setIsListening(false);
      stopDetection();

      try {
        await stopAudioRecording();

        // Preview mode: do not call backend submitAnswer.
        if (previewMode || !interviewId) {
          if (endNow || previewQuestionIndexRef.current >= previewQuestions.length) {
            await handleInterviewComplete();
            return;
          }

          const nextQuestion = getNextPreviewQuestion();
          setCurrentQuestion(nextQuestion);
          await playQuestionAndListen(nextQuestion);
          return;
        }

        const emotion = getCurrentEmotion();

        const formData = new FormData();
        formData.append("interview_id", interviewId);
        formData.append("emotion", emotion);
        formData.append("end_now", String(endNow));

        const data = await submitAnswer(interviewId, formData);

        if (data?.finished) {
          await handleInterviewComplete();
        } else if (data?.question) {
          setCurrentQuestion(data.question);
          await playQuestionAndListen(data.question);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);

        toast({
          title: "Error",
          description: "Failed to process your answer. Continuing...",
          variant: "destructive",
        });

        if (stream) startListening();
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      previewMode,
      interviewId,
      previewQuestions.length,
      stopDetection,
      stopAudioRecording,
      getCurrentEmotion,
      handleInterviewComplete,
      playQuestionAndListen,
      toast,
      stream,
      startListening,
    ]
  );

  useEffect(() => {
    submitAnswerRef.current = handleAnswerSubmit;
  }, [handleAnswerSubmit]);

  const handleEndInterview = useCallback(async () => {
    setIsListening(false);
    stopDetection();

    try {
      await stopAudioRecording();

      // Preview mode: skip backend endInterview.
      if (previewMode || !interviewId) {
        await handleInterviewComplete();
        return;
      }

      const emotion = getCurrentEmotion();

      const formData = new FormData();
      formData.append("interview_id", interviewId);
      formData.append("emotion", emotion);
      formData.append("end_now", "true");

      try {
        await endInterview(interviewId, formData);
      } catch (error) {
        console.error("Error ending interview:", error);
      }

      await handleInterviewComplete();
    } catch (error) {
      console.error("Error stopping interview:", error);
      await handleInterviewComplete();
    }
  }, [
    previewMode,
    interviewId,
    stopDetection,
    stopAudioRecording,
    getCurrentEmotion,
    handleInterviewComplete,
  ]);

  const startPreviewInterview = async () => {
    const firstQuestion = getNextPreviewQuestion();

    setInterviewId(null);
    setCurrentQuestion(firstQuestion);

    await startRecording();

    if (videoRef.current && isModelLoaded) {
      startEmotionDetection(videoRef.current);
    }

    setElapsedTime(0);
    setSessionStarted(true);

    toast({
      title: "Preview Interview Started",
      description: "Backend is skipped. You can now view and test the interview page.",
    });

    await playQuestionAndListen(firstQuestion);
  };

  const handleStart = async () => {
    setIsStarting(true);

    try {
      // Main fix: if no backend interview ID exists, start locally instead of calling API.
      if (previewMode) {
        await startPreviewInterview();
        return;
      }

      if (!userId) {
        toast({
          title: "Missing User",
          description: "User ID was not found.",
          variant: "destructive",
        });
        return;
      }

      const data = await startInterview(userId, {
        company_name: companyName,
        job_title: jobTitle,
        context_summary: contextSummary,
      });

      const createdInterviewId = data?.interview_id || data?.id || null;
      const firstQuestion =
        data?.question ||
        `Tell me about yourself and why you are interested in the ${jobTitle || "role"}.`;

      setInterviewId(createdInterviewId);
      setCurrentQuestion(firstQuestion);

      await startRecording();

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

      // Fallback: even if backend fails here, open the interview page anyway.
      toast({
        title: "Preview Mode",
        description: "Backend failed, so the interview is starting without saving.",
      });

      await startPreviewInterview();
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
                  <p className="font-medium text-destructive">
                    Camera/Microphone Access Required
                  </p>
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
              {companyName && jobTitle
                ? `${jobTitle} at ${companyName}`
                : "Mock Interview"}
            </h1>

            {previewMode && (
              <div className="mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-700 dark:text-yellow-300">
                Preview mode is enabled. The backend interview API will be skipped.
              </div>
            )}

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

            <Button
              variant="ghost"
              className="mt-4 block mx-auto"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
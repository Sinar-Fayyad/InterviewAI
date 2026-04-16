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
import { startInterview, submitAnswer, endInterview } from "@/services/interviewService";

interface LocationState {
  companyName?: string;
  jobTitle?: string;
  contextSummary?: string;
  interviewId?: string;
}

export default function MockInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { userId } = useAuth();
  
  const { isRecording, stream, videoRef, startRecording, stopRecording, error: mediaError } = useMediaRecorder();
  const { startDetection, stopDetection } = useSilenceDetection();
  const { initializeFaceApi, startEmotionDetection, stopEmotionDetection, getCurrentEmotion, isModelLoaded } = useFaceEmotion();
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  const { startAudioRecording, stopAudioRecording, isRecording: isAudioRecording } = useAudioRecorder();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [interviewId, setInterviewId] = useState<string | null>(state?.interviewId || null);
  const [isStarting, setIsStarting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const companyName = state?.companyName || "";
  const jobTitle = state?.jobTitle || "";
  const contextSummary = state?.contextSummary || "";

  useEffect(() => { initializeFaceApi(); }, [initializeFaceApi]);

  useEffect(() => {
    if (isRecording && sessionStarted) {
      timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, sessionStarted]);

  const handleAnswerSubmit = useCallback(async (endNow: boolean = false) => {
    if (isProcessing || !interviewId) return;
    setIsProcessing(true);
    setIsListening(false);
    
    try {
      stopDetection();
      const audioFile = await stopAudioRecording();
      const emotion = getCurrentEmotion();
      
      const formData = new FormData();
      formData.append("interview_id", interviewId);
      formData.append("emotion", emotion);
      formData.append("end_now", String(endNow));
      if (audioFile) formData.append("audio", audioFile);
      
      const data = await submitAnswer(interviewId, formData);
      
      if (data?.finished) {
        await handleInterviewComplete();
      } else if (data?.question) {
        setCurrentQuestion(data.question);
        await playQuestionAndListen(data.question);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({ title: "Error", description: "Failed to process your answer. Continuing...", variant: "destructive" });
      if (stream) startListening();
    } finally {
      setIsProcessing(false);
    }
  }, [interviewId, isProcessing, stream, stopDetection, stopAudioRecording, getCurrentEmotion, toast]);

  const playQuestionAndListen = useCallback(async (question: string) => {
    try { await speak(question); startListening(); } catch { startListening(); }
  }, [speak]);

  const startListening = useCallback(() => {
    if (!stream) return;
    setIsListening(true);
    startAudioRecording(stream);
    startDetection(stream, () => handleAnswerSubmit(false));
  }, [stream, startAudioRecording, startDetection, handleAnswerSubmit]);

  const handleInterviewComplete = useCallback(async () => {
    stopDetection();
    stopEmotionDetection();
    stopSpeaking();
    const blob = await stopRecording();
    recordedBlobRef.current = blob;
    setSessionStarted(false);
    navigate(`/save-interview?id=${interviewId}`, {
      state: { videoBlob: blob, interviewId, companyName, jobTitle, duration: elapsedTime },
    });
  }, [interviewId, companyName, jobTitle, elapsedTime, navigate, stopDetection, stopEmotionDetection, stopSpeaking, stopRecording]);

  const handleEndInterview = useCallback(async () => {
    setIsListening(false);
    stopDetection();
    const audioFile = await stopAudioRecording();
    const emotion = getCurrentEmotion();
    
    const formData = new FormData();
    formData.append("interview_id", interviewId || "");
    formData.append("emotion", emotion);
    formData.append("end_now", "true");
    if (audioFile) formData.append("audio", audioFile);
    
    try {
      await endInterview(interviewId || "", formData);
    } catch (error) {
      console.error("Error ending interview:", error);
    }
    await handleInterviewComplete();
  }, [interviewId, stopDetection, stopAudioRecording, getCurrentEmotion, handleInterviewComplete]);

  const handleStart = async () => {
    if (!userId) return;
    setIsStarting(true);
    try {
      const data = await startInterview(userId, {
        company_name: companyName,
        job_title: jobTitle,
        context_summary: contextSummary,
      });
      
      setInterviewId(data?.interview_id || data?.id);
      setCurrentQuestion(data?.question || "");
      await startRecording();
      if (videoRef.current && isModelLoaded) startEmotionDetection(videoRef.current);
      setElapsedTime(0);
      setSessionStarted(true);
      toast({ title: "Interview Started", description: "Recording has begun. Good luck!" });
      if (data?.question) await playQuestionAndListen(data.question);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({ title: "Error", description: "Failed to start interview. Please try again.", variant: "destructive" });
    } finally {
      setIsStarting(false);
    }
  };

  if (sessionStarted && isRecording) {
    return (
      <ProtectedRoute>
        <InterviewMode currentQuestion={currentQuestion} isRecording={isRecording} elapsedTime={elapsedTime} videoRef={videoRef} stream={stream} onEndInterview={handleEndInterview} isSpeaking={isSpeaking} isListening={isListening} />
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
              The AI will ask you questions and analyze your responses in real-time. The interview will be recorded for feedback.
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
                <Loader2 className="w-4 h-4 animate-spin" />Loading face detection models...
              </div>
            )}
            <Button variant="hero" size="lg" onClick={handleStart} disabled={isStarting} className="px-12">
              {isStarting ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Starting...</>) : (<><Play className="w-5 h-5 mr-2" />Start Interview</>)}
            </Button>
            <Button variant="ghost" className="mt-4 block mx-auto" onClick={() => navigate(-1)}>Go Back</Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

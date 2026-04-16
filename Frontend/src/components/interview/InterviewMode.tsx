import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Square, Maximize2, Minimize2, Subtitles, MessageSquareOff } from "lucide-react";

interface InterviewModeProps {
  currentQuestion: string;
  isRecording: boolean;
  elapsedTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  onEndInterview: () => void;
  isSpeaking: boolean;
  isListening: boolean;
}

export const InterviewMode = ({
  currentQuestion,
  isRecording,
  elapsedTime,
  videoRef,
  stream,
  onEndInterview,
  isSpeaking,
  isListening,
}: InterviewModeProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleCaption = () => {
    setShowCaption(!showCaption);
  };

  // Auto-launch fullscreen on mount
  useEffect(() => {
    const launchFullscreen = async () => {
      try {
        if (containerRef.current && !document.fullscreenElement) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.log("Fullscreen not supported or denied:", error);
      }
    };
    
    const timer = setTimeout(launchFullscreen, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isFullscreen) {
    // Full Screen Mode - Camera full screen with caption overlay
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Full screen video */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
          />
          
          {/* Top overlay - recording status */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex gap-2">
              <Badge variant="destructive" className="animate-pulse bg-red-600">
                <div className="w-2 h-2 rounded-full bg-white mr-2"></div>
                Recording
              </Badge>
              <Badge variant="secondary" className="bg-black/60 text-white border-0">
                {formatTime(elapsedTime)}
              </Badge>
              {isSpeaking && (
                <Badge variant="secondary" className="bg-blue-600 text-white border-0">
                  🔊 Speaking
                </Badge>
              )}
              {isListening && (
                <Badge variant="secondary" className="bg-green-600 text-white border-0">
                  🎤 Listening
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCaption}
                className="text-white hover:bg-white/20"
              >
                {showCaption ? <Subtitles className="w-5 h-5" /> : <MessageSquareOff className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Bottom overlay - Question caption */}
          {showCaption && currentQuestion && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8 z-10">
              <div className="max-w-4xl mx-auto">
                <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed text-center mb-6">
                  {currentQuestion}
                </p>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={onEndInterview}
                  >
                    <Square className="w-5 h-5 mr-2" />
                    End Interview
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* End button when caption hidden */}
          {!showCaption && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <Button 
                variant="destructive" 
                size="lg"
                onClick={onEndInterview}
              >
                <Square className="w-5 h-5 mr-2" />
                End Interview
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Split Screen Mode - Camera left, question right
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 grid grid-cols-1 lg:grid-cols-2 gap-0 bg-background z-50"
    >
      {/* Left side - Video feed */}
      <div className="relative bg-muted flex items-center justify-center">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${stream ? 'block' : 'hidden'}`}
          playsInline
        />
        
        {!stream && (
          <div className="text-center text-muted-foreground">
            <Video className="w-16 h-16 mx-auto mb-4" />
            <p>Camera initializing...</p>
          </div>
        )}

        {/* Recording overlay */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <div className="w-2 h-2 rounded-full bg-destructive-foreground mr-2"></div>
            Recording
          </Badge>
          <Badge variant="secondary">
            {formatTime(elapsedTime)}
          </Badge>
        </div>

        {/* Status indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {isSpeaking && (
            <Badge variant="secondary" className="bg-blue-600 text-white border-0">
              🔊 Speaking
            </Badge>
          )}
          {isListening && (
            <Badge variant="secondary" className="bg-green-600 text-white border-0">
              🎤 Listening
            </Badge>
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
          <Button 
            variant="destructive" 
            size="lg"
            onClick={onEndInterview}
          >
            <Square className="w-5 h-5 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Right side - Question sidebar */}
      <div className="bg-secondary flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex gap-2">
            {isSpeaking && <Badge variant="outline">AI Speaking</Badge>}
            {isListening && <Badge variant="outline">Your Turn</Badge>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCaption}
            >
              {showCaption ? <Subtitles className="w-4 h-4 mr-2" /> : <MessageSquareOff className="w-4 h-4 mr-2" />}
              Caption
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Full Screen
            </Button>
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          {showCaption && currentQuestion ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Current Question
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-relaxed">
                {currentQuestion}
              </h2>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <MessageSquareOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Caption hidden</p>
              <p className="text-sm mt-2">Click the caption button to show the question</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

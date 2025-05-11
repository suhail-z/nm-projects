
import { useState, useRef, useEffect } from "react";
import { Mic, X, StopCircle, PlayCircle, FileAudio, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const RecordPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
        
        setAudioBlob(audioBlob);
        
        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      
      toast({
        title: "Recording started",
        description: "Speak clearly for best results.",
      });
      
    } catch (error) {
      toast({
        title: "Permission denied",
        description: "Please allow microphone access to record.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: `Recorded ${formatTime(recordingTime)}.`,
      });
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const clearRecording = () => {
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setUploadProgress(0);
    setAnalyzing(false);
  };

  const handleAnalyze = () => {
    if (!audioBlob) return;
    
    setAnalyzing(true);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Analysis complete",
            description: "Your recording has been analyzed successfully.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Record Live Call</h2>
        <p className="text-muted-foreground">
          Record and analyze audio in real-time for compliance monitoring
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div 
            className={cn(
              "border-2 rounded-xl h-64 flex flex-col items-center justify-center p-6 transition-colors",
              isRecording ? "border-destructive bg-destructive/5 animate-pulse-slow" : "border-border"
            )}
          >
            {!audioBlob ? (
              <>
                <div className={cn(
                  "mb-4 p-3 rounded-full", 
                  isRecording ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                )}>
                  <Mic className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {isRecording ? "Recording in progress..." : "Ready to record"}
                </h3>
                
                {isRecording ? (
                  <div className="text-center">
                    <div className="text-2xl font-mono mb-4">{formatTime(recordingTime)}</div>
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      className="animate-pulse"
                    >
                      <StopCircle className="h-5 w-5 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      Click the button below to start recording<br />
                      Make sure your microphone is connected
                    </p>
                    <Button
                      onClick={startRecording}
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Start Recording
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileAudio className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="font-medium">
                        Recorded Audio
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {formatTime(recordingTime)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearRecording}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <audio ref={audioRef} className="hidden" />
                
                <div className="flex justify-center mb-4">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full h-12 w-12"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? 
                      <StopCircle className="h-6 w-6" /> : 
                      <PlayCircle className="h-6 w-6" />
                    }
                  </Button>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Analyzing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            )}
          </div>

          {audioBlob && uploadProgress === 0 && (
            <Button 
              className="w-full" 
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              Analyze Recording
            </Button>
          )}

          {uploadProgress === 100 && (
            <Button 
              className="w-full" 
              asChild
            >
              <Link to="/transcript">
                View Analysis
              </Link>
            </Button>
          )}
        </div>

        <div>
          <div className="call-card">
            <h3 className="text-lg font-medium mb-4">Recording Guidelines</h3>
            
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium">Consent Required</h4>
                <p className="text-sm text-muted-foreground">
                  Always ensure you have consent from all parties before recording any call.
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium">Optimal Sound</h4>
                <p className="text-sm text-muted-foreground">
                  Record in a quiet environment with minimal background noise for the best results.
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium">Speak Clearly</h4>
                <p className="text-sm text-muted-foreground">
                  For accurate transcription, speak clearly and at a moderate pace.
                </p>
              </div>
              
              <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                <h4 className="font-medium">Have a Pre-recorded Call?</h4>
                <p className="text-sm mb-2">
                  Need to analyze an existing recording instead?
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/upload">
                    <Upload className="mr-1 h-4 w-4" />
                    Switch to File Upload
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RecordPage;

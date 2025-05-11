import { useState, useRef } from "react";
import { Upload, X, FileAudio, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { uploadCall } from "@/services/callService";

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    // Check if file is audio file
    if (!file.type.includes("audio")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .wav or .mp3 file",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Calculate duration (you might want to get this from the audio file metadata)
      const duration = "00:00"; // Placeholder duration
      
      // Upload the file
      const result = await uploadCall(file, {
        agent: "Unknown Agent", // You might want to get this from user input
        customer: "Unknown Customer", // You might want to get this from user input
        duration: duration
      });

      // Update progress
      setUploadProgress(100);
      
      // Show success message
      toast({
        title: "Upload complete",
        description: "Your file has been uploaded successfully.",
      });

      // Navigate to the transcript page with the job ID
      navigate(`/transcript?id=${result.job_id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Upload Call Recording</h2>
        <p className="text-muted-foreground">
          Upload an audio file (.wav or .mp3) for compliance analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div 
            className={cn(
              "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center p-6 transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border",
              file ? "bg-muted/50" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">
                  <Upload className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Drag and drop your audio file here
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  or click to browse files<br />
                  Supported formats: .wav, .mp3
                </p>
                <Button
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileAudio className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="font-medium truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            )}
          </div>

          {file && uploadProgress === 0 && (
            <Button 
              className="w-full" 
              onClick={handleUpload}
              disabled={uploading}
            >
              Upload and Analyze
            </Button>
          )}
        </div>

        <div className="call-card">
          <h3 className="text-lg font-medium mb-4">Tips for Better Analysis</h3>
          
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium">Audio Quality</h4>
              <p className="text-sm text-muted-foreground">
                Upload clear, high-quality audio files for the most accurate transcription and compliance analysis.
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium">File Size</h4>
              <p className="text-sm text-muted-foreground">
                For best results, keep files under 50MB. Larger files may take longer to process.
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium">Supported Formats</h4>
              <p className="text-sm text-muted-foreground">
                We support .wav and .mp3 formats. Convert other formats before uploading.
              </p>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
              <h4 className="font-medium">Live Recording</h4>
              <p className="text-sm mb-2">
                Need to analyze a live call instead?
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/record">
                  <Mic className="mr-1 h-4 w-4" />
                  Switch to Live Recording
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UploadPage;

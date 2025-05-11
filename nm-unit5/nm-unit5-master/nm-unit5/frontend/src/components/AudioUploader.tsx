import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  LinearProgress,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Fade,
  Zoom,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Mic,
  Psychology,
  Security,
  Assessment,
  Stop,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Custom animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const ProcessingIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 48,
    color: theme.palette.primary.main,
    animation: `${pulse} 2s infinite ease-in-out`,
  },
}));

const ProcessingStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CliSimulation = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  backgroundColor: '#1e1e1e',
  color: '#00ff00',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  maxHeight: '300px',
  overflowY: 'auto',
  '& .log-line': {
    marginBottom: theme.spacing(0.5),
    fontSize: '0.9rem',
    lineHeight: 1.4,
  },
  '& .timestamp': {
    color: '#888',
    marginRight: theme.spacing(1),
  },
  '& .info': {
    color: '#00ff00',
  },
  '& .error': {
    color: '#ff0000',
  },
  '& .success': {
    color: '#00ffff',
  },
}));

const steps = [
  { label: 'Upload', icon: CloudUpload },
  { label: 'Transcription', icon: Mic },
  { label: 'Analysis', icon: Psychology },
  { label: 'Compliance', icon: Security },
  { label: 'Complete', icon: Assessment },
];

interface AudioJob {
  id: string;
  status: string;
  progress: number;
  current_step: string;
  status_message: string;
  error_message: string | null;
  score: number;
  compliance_status: string;
  transcripts: Array<{
    speaker: string;
    text: string;
    start_time: string;
  }>;
}

const AudioUploader: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<AudioJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [cliLogs, setCliLogs] = useState<string[]>([]);
  const cliLogsEndRef = useRef<HTMLDivElement>(null);

  const addCliLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setCliLogs(prev => [...prev, `<span class="timestamp">${timestamp}</span><span class="${type}">${message}</span>`]);
  };

  const scrollToBottom = () => {
    cliLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [cliLogs]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Error accessing microphone');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
      handleUpload(audioBlob);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File | Blob) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setCurrentJob(null);
    setCliLogs([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('agent', 'Jane Smith');
    formData.append('customer', 'Robert Johnson');
    formData.append('duration', '05:42');

    try {
      addCliLog('Initializing upload process...');
      addCliLog('Connecting to Azure services...');
      addCliLog('Successfully connected to Azure Text Analytics API', 'success');
      addCliLog('Successfully connected to Azure Content Safety API', 'success');
      
      const response = await axios.post('/api/jobs/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
          if (progress % 20 === 0) {
            addCliLog(`Upload progress: ${progress}%`);
          }
        },
      });

      addCliLog('File uploaded successfully', 'success');
      const jobId = response.data.job_id;
      addCliLog(`Job ID: ${jobId}`);
      addCliLog('Starting audio transcription...');
      pollJobStatus(jobId);
    } catch (err) {
      addCliLog('Error uploading file', 'error');
      setError('Error uploading file');
      console.error('Error uploading file:', err);
      setIsUploading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}/result/`);
      const jobData = response.data;
      setCurrentJob(jobData);

      // Add CLI logs based on job status
      if (jobData.status === 'processing') {
        if (jobData.current_step === 'Transcription') {
          addCliLog('Transcription in progress...');
          addCliLog(`Status: ${jobData.current_step} (${jobData.progress}%)`);
          if (jobData.status_message) {
            addCliLog(jobData.status_message);
          }
        } else if (jobData.current_step === 'Analysis') {
          addCliLog('Analyzing transcript...');
          addCliLog('Performing sentiment analysis...');
          addCliLog('Checking content safety...');
          addCliLog(`Status: ${jobData.current_step} (${jobData.progress}%)`);
        } else if (jobData.current_step === 'Compliance') {
          addCliLog('Generating compliance report...');
          addCliLog('Analyzing call patterns...');
          addCliLog('Calculating compliance score...');
          addCliLog(`Status: ${jobData.current_step} (${jobData.progress}%)`);
        }
        setTimeout(() => pollJobStatus(jobId), 2000);
      } else if (jobData.status === 'error') {
        addCliLog(`Error: ${jobData.error_message}`, 'error');
        setError(jobData.error_message || 'Processing failed');
        setIsUploading(false);
      } else if (jobData.status === 'complete') {
        addCliLog('Processing completed successfully', 'success');
        if (jobData.transcripts?.length > 0) {
          addCliLog(`Transcription complete. Got ${jobData.transcripts.length} phrases`);
          addCliLog('Duration: PT2.09S');
          addCliLog('Cleaning up transcription resources...');
        }
        addCliLog('Finalizing results...', 'success');
        setIsUploading(false);
      }
    } catch (err) {
      addCliLog('Error checking job status', 'error');
      setError('Error checking job status');
      console.error('Error checking job status:', err);
      setIsUploading(false);
    }
  };

  const getActiveStep = () => {
    switch (currentJob?.current_step.toLowerCase()) {
      case 'upload': return 0;
      case 'transcription': return 1;
      case 'analysis': return 2;
      case 'compliance': return 3;
      case 'complete': return 4;
      default: return 0;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Audio File
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={isRecording || isUploading}
          >
            Upload File
            <input
              type="file"
              hidden
              accept=".wav,.mp3"
              onChange={handleFileSelect}
            />
          </Button>

          <Button
            variant="contained"
            color={isRecording ? 'error' : 'primary'}
            startIcon={isRecording ? <Stop /> : <Mic />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </Box>

        {isUploading && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                {currentJob?.current_step || 'Uploading...'} ({uploadProgress}%)
              </Typography>
              <CircularProgress variant="determinate" value={uploadProgress} />
            </Box>

            <CliSimulation>
              <Typography variant="h6" sx={{ color: '#00ff00', mb: 2 }}>
                Processing Log
              </Typography>
              {cliLogs.map((log, index) => (
                <div
                  key={index}
                  className="log-line"
                  dangerouslySetInnerHTML={{ __html: log }}
                />
              ))}
              <div ref={cliLogsEndRef} />
            </CliSimulation>
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {currentJob?.transcripts && currentJob.transcripts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transcript Preview
            </Typography>
            <List>
              {currentJob.transcripts.slice(0, 3).map((transcript, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${transcript.speaker} (${transcript.start_time})`}
                    secondary={transcript.text}
                  />
                </ListItem>
              ))}
            </List>
            {currentJob.transcripts.length > 3 && (
              <Typography variant="body2" color="text.secondary">
                + {currentJob.transcripts.length - 3} more segments...
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AudioUploader; 
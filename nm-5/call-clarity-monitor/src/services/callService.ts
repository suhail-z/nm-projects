import callData from '../data/call-data.json';

const API_BASE_URL = 'http://localhost:8000/api';

export interface CallRecord {
  id: string;
  date: string;
  time: string;
  agent: string;
  customer: string;
  duration: string;
  status: "compliant" | "warning" | "violation";
  score: number;
}

export interface TranscriptSegment {
  id: string;
  speaker: "agent" | "customer";
  text: string;
  time: string;
  flagged?: boolean;
  flagReason?: string;
}

export interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: "compliant" | "warning" | "violation";
  details: string;
  timestamp?: string;
}

export interface CallAnalytics {
  agentTalkTime: number;
  customerTalkTime: number;
  agentTone: number;
  customerSentiment: number;
  silencePeriods: number;
  interruptionCount: number;
  keyPhrases: string[];
}

export interface DetailedCallData {
  id: string;
  date: string;
  time: string;
  agent: string;
  customer: string;
  duration: string;
  status: "compliant" | "warning" | "violation";
  score: number;
  transcript: TranscriptSegment[];
  complianceItems: ComplianceItem[];
  analytics: CallAnalytics;
}

export const getCallHistory = async (): Promise<CallRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/`);
    if (!response.ok) {
      throw new Error('Failed to fetch call history');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching call history:', error);
    // Fallback to mock data if API fails
    return callData.callHistory.map(call => ({
      id: call.id,
      date: call.date,
      time: call.time,
      agent: call.agent,
      customer: call.customer,
      duration: call.duration,
      status: call.status as "compliant" | "warning" | "violation",
      score: call.score
    }));
  }
};

export const getCallById = async (id: string): Promise<DetailedCallData | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/result/`);
    if (!response.ok) {
      throw new Error('Failed to fetch call details');
    }
    const data = await response.json();
    return {
      id: data.id,
      date: new Date(data.created_at).toLocaleDateString(),
      time: new Date(data.created_at).toLocaleTimeString(),
      agent: data.agent,
      customer: data.customer,
      duration: data.duration,
      status: data.compliance_status,
      score: data.score,
      transcript: data.transcripts.map((t: any) => ({
        id: t.id,
        speaker: t.speaker,
        text: t.text,
        time: t.start_time,
        flagged: t.flagged,
        flagReason: t.flag_reason
      })),
      complianceItems: data.compliance_report.checklist,
      analytics: {
        agentTalkTime: data.analytics.agent_talk_time,
        customerTalkTime: data.analytics.customer_talk_time,
        agentTone: data.analytics.agent_tone,
        customerSentiment: data.analytics.customer_sentiment,
        silencePeriods: data.analytics.silence_periods,
        interruptionCount: data.analytics.interruption_count,
        keyPhrases: data.analytics.key_phrases
      }
    };
  } catch (error) {
    console.error('Error fetching call details:', error);
    // Fallback to mock data if API fails
    return callData.callHistory.find(call => call.id === id) as DetailedCallData;
  }
};

export const uploadCall = async (file: File, metadata: {
  agent: string;
  customer: string;
  duration: string;
}): Promise<{ job_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('agent', metadata.agent);
  formData.append('customer', metadata.customer);
  formData.append('duration', metadata.duration);

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload call');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading call:', error);
    throw error;
  }
};

export const getCallStatus = async (jobId: string): Promise<{
  status: string;
  error_message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status/`);
    if (!response.ok) {
      throw new Error('Failed to fetch call status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching call status:', error);
    throw error;
  }
};

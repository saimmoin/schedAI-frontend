import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../core/api';
import { format, parseISO } from 'date-fns';
import { Mic, Square, Save, ArrowLeft, FileText, Clock } from 'lucide-react';
import { toast, ToastContainer } from '../components/shared/Toast';
import clsx from 'clsx';

export default function MeetingRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<any>(null);

  const { data: appointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsApi.getWeek(format(new Date(), 'yyyy-MM-dd')).then((r) => 
      r.data.find((a: any) => a.id === parseInt(appointmentId!))
    ),
    enabled: !!appointmentId,
  });

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        setTranscript((prev) => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          toast('No speech detected. Keep talking!', 'warn');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      setRecording(true);
      toast('Recording started', 'success');
    } else {
      toast('Speech recognition not supported in this browser', 'error');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      toast('Recording stopped', 'info');
    }
  };

  const saveTranscript = async () => {
    if (!transcript.trim()) {
      toast('No transcript to save', 'warn');
      return;
    }

    setSaving(true);
    try {
      await appointmentsApi.saveTranscript(parseInt(appointmentId!), transcript);
      toast('Transcript saved!', 'success');
      setTimeout(() => navigate(`/debrief/${appointmentId}`), 1500);
    } catch {
      toast('Failed to save transcript', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading meeting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      <ToastContainer />

      {/* Header */}
      <div className="border-b border-bg-border bg-bg-secondary px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/calendar')} className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">{appointment.title}</h1>
            <p className="text-text-secondary text-sm font-body mt-0.5">
              {format(parseISO(appointment.start_time), 'EEEE, MMMM d · h:mm a')} · {appointment.guest_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!recording ? (
            <button onClick={startRecording} className="btn-primary flex items-center gap-2">
              <Mic size={16} />
              Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="btn-danger flex items-center gap-2 animate-pulse">
              <Square size={16} />
              Stop Recording
            </button>
          )}

          {transcript && !recording && (
            <button onClick={saveTranscript} disabled={saving} className="btn-secondary flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              Save & Generate Debrief
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Recording status */}
        {recording && (
          <div className="card p-6 bg-accent-danger bg-opacity-5 border-accent-danger border-opacity-20 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent-danger animate-pulse" />
              <div>
                <p className="font-display font-semibold text-text-primary">Recording in progress</p>
                <p className="text-text-secondary text-sm font-body">Speak clearly. Transcript appears below in real-time.</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!recording && !transcript && (
          <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary bg-opacity-10 border border-accent-primary border-opacity-20 flex items-center justify-center mx-auto">
              <Mic size={28} className="text-accent-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary">Ready to Record</h2>
              <p className="text-text-secondary text-sm font-body mt-2 max-w-md mx-auto">
                Click "Start Recording" to begin live transcription. Your browser will capture audio and convert it to text in real-time.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-text-muted text-xs">
                <Clock size={14} />
                <span>No time limit</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-xs">
                <FileText size={14} />
                <span>Auto-saved</span>
              </div>
            </div>
          </div>
        )}

        {/* Live transcript */}
        {transcript && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-accent-primary" />
                <h2 className="font-display font-semibold text-text-primary">Live Transcript</h2>
              </div>
              {recording && (
                <div className="flex items-center gap-2 text-accent-danger text-sm font-mono">
                  <div className="w-2 h-2 rounded-full bg-accent-danger animate-pulse" />
                  Recording...
                </div>
              )}
            </div>
            <div className="bg-bg-secondary rounded-xl p-6 max-h-96 overflow-y-auto">
              <p className="text-text-primary font-body leading-relaxed whitespace-pre-wrap">
                {transcript || 'Transcript will appear here...'}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-text-muted text-xs">
              <span>{transcript.split(' ').filter(Boolean).length} words</span>
              <span>{Math.ceil(transcript.length / 5)} characters</span>
            </div>
          </div>
        )}

        {/* Next steps */}
        {transcript && !recording && (
          <div className="card p-6 bg-accent-success bg-opacity-5 border-accent-success border-opacity-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-success bg-opacity-10 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-accent-success" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-text-primary">Transcript Ready</p>
                <p className="text-text-secondary text-sm font-body">Click "Save & Generate Debrief" to save this transcript and let Claude AI analyze it.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

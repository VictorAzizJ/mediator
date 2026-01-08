// Deepgram integration for real-time transcription with speaker diarization
// This module handles the WebSocket connection to Deepgram's API

export interface DeepgramConfig {
  apiKey: string;
  model?: string;
  language?: string;
  punctuate?: boolean;
  diarize?: boolean;
  interimResults?: boolean;
  utteranceEndMs?: number;
  vadEvents?: boolean;
}

export interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
  punctuated_word?: string;
}

export interface DeepgramAlternative {
  transcript: string;
  confidence: number;
  words: DeepgramWord[];
}

export interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

export interface DeepgramResult {
  type: 'Results';
  channel_index: number[];
  duration: number;
  start: number;
  is_final: boolean;
  speech_final: boolean;
  channel: DeepgramChannel;
}

export interface DeepgramMessage {
  type: string;
  channel?: DeepgramChannel;
  is_final?: boolean;
  speech_final?: boolean;
  start?: number;
  duration?: number;
}

export type DeepgramEventHandler = {
  onTranscript?: (result: DeepgramResult) => void;
  onSpeechStarted?: () => void;
  onUtteranceEnd?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onOpen?: () => void;
};

const DEFAULT_CONFIG: Partial<DeepgramConfig> = {
  model: 'nova-2',
  language: 'en-US',
  punctuate: true,
  diarize: true,
  interimResults: true,
  utteranceEndMs: 1000,
  vadEvents: true,
};

export class DeepgramClient {
  private ws: WebSocket | null = null;
  private config: DeepgramConfig;
  private handlers: DeepgramEventHandler;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;

  constructor(config: DeepgramConfig, handlers: DeepgramEventHandler = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.handlers = handlers;
  }

  async connect(): Promise<void> {
    if (this.ws) {
      throw new Error('Already connected');
    }

    // Build query params
    const params = new URLSearchParams({
      model: this.config.model || 'nova-2',
      language: this.config.language || 'en-US',
      punctuate: String(this.config.punctuate ?? true),
      diarize: String(this.config.diarize ?? true),
      interim_results: String(this.config.interimResults ?? true),
      utterance_end_ms: String(this.config.utteranceEndMs ?? 1000),
      vad_events: String(this.config.vadEvents ?? true),
      smart_format: 'true',
    });

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl, ['token', this.config.apiKey]);

      this.ws.onopen = () => {
        this.handlers.onOpen?.();
        resolve();
      };

      this.ws.onerror = (event) => {
        const error = new Error('WebSocket connection failed');
        this.handlers.onError?.(error);
        reject(error);
      };

      this.ws.onclose = () => {
        this.handlers.onClose?.();
        this.ws = null;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as DeepgramMessage;
          this.handleMessage(data);
        } catch (e) {
          console.error('Failed to parse Deepgram message:', e);
        }
      };
    });
  }

  private handleMessage(data: DeepgramMessage): void {
    switch (data.type) {
      case 'Results':
        if (data.channel?.alternatives?.[0]) {
          this.handlers.onTranscript?.(data as DeepgramResult);
        }
        break;
      case 'SpeechStarted':
        this.handlers.onSpeechStarted?.();
        break;
      case 'UtteranceEnd':
        this.handlers.onUtteranceEnd?.();
        break;
      default:
        // Metadata or other message types
        break;
    }
  }

  async startRecording(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.stream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(this.audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = this.floatTo16BitPCM(inputData);
          this.ws.send(pcmData);
        }
      };
    } catch (error) {
      throw new Error(`Failed to access microphone: ${error}`);
    }
  }

  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  stopRecording(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  disconnect(): void {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Helper to create a Deepgram client with server-side API key
export async function createDeepgramClient(
  handlers: DeepgramEventHandler = {}
): Promise<DeepgramClient | null> {
  // Fetch API key from server endpoint
  try {
    const response = await fetch('/api/transcription/token');
    if (!response.ok) {
      console.warn('Transcription not available - API key not configured');
      return null;
    }
    const { apiKey } = await response.json();

    if (!apiKey) {
      console.warn('Transcription not available - no API key returned');
      return null;
    }

    return new DeepgramClient({ apiKey }, handlers);
  } catch (error) {
    console.warn('Failed to initialize transcription:', error);
    return null;
  }
}

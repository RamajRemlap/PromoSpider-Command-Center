
import { VoiceCommand, VoiceCommandType } from '../types';
import { View } from '../App';

// Type definition for the browser API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

export class VoiceService {
  private recognition: any;
  public isListening: boolean = false;
  private onCommandCallback: ((cmd: VoiceCommand) => void) | null = null;
  private onStatusChangeCallback: ((isListening: boolean) => void) | null = null;

  constructor() {
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true; // Keep listening
      this.recognition.interimResults = false; // Only final results
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        console.log('[VoiceService] Heard:', transcript);
        this.processInput(transcript);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Auto-restart if it stops unexpectedly while we think we are listening
          try {
            this.recognition.start();
          } catch (e) {
            // Likely already running or stopped by error
          }
        } else {
          this.updateStatus(false);
        }
      };

      this.recognition.onerror = (event: any) => {
        // 'no-speech' is a normal event when the room is quiet.
        // We treat it as a warning to avoid polluting the error logs.
        if (event.error === 'no-speech') {
          console.warn('[VoiceService] Idle: No speech detected.');
          return;
        }

        console.error('[VoiceService] Error:', event.error);
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          this.updateStatus(false);
        }
      };
    }
  }

  public setOnCommand(cb: (cmd: VoiceCommand) => void) {
    this.onCommandCallback = cb;
  }

  public setOnStatusChange(cb: (status: boolean) => void) {
    this.onStatusChangeCallback = cb;
  }

  public async start() {
    if (!this.recognition) {
      console.warn("Speech Recognition API not supported.");
      return;
    }

    try {
      // Explicitly request microphone access to trigger browser permission prompt.
      // This is more robust in nested frame environments.
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.isListening = true;
      this.recognition.start();
      this.updateStatus(true);
    } catch (e) {
      console.error("[VoiceService] Permission denied or start failed:", e);
      this.isListening = false;
      this.updateStatus(false);
    }
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
    this.updateStatus(false);
  }

  private updateStatus(status: boolean) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  private processInput(rawText: string) {
    const cmd: VoiceCommand = {
      raw: rawText,
      type: 'UNKNOWN'
    };

    // Intent Mapping logic
    if (rawText.includes('autonomous mode') || rawText.includes('start system') || rawText.includes('autopilot')) {
      cmd.type = 'ACTIVATE_AUTONOMOUS';
    } 
    else if (rawText.includes('stop system') || rawText.includes('manual mode') || rawText.includes('abort')) {
      cmd.type = 'DEACTIVATE_AUTONOMOUS';
    }
    else if (rawText.includes('status report') || rawText.includes('system check') || rawText.includes('report')) {
      cmd.type = 'SYSTEM_REPORT';
    }
    else if (rawText.includes('dashboard')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.DASHBOARD;
    }
    else if (rawText.includes('live feed') || rawText.includes('logs')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.LIVE_FEED;
    }
    else if (rawText.includes('agents') || rawText.includes('swarm')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.AGENTS;
    }
    else if (rawText.includes('pipeline')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.PIPELINE;
    }
    else if (rawText.includes('cortex') || rawText.includes('sentient')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.SENTIENT;
    }
    else if (rawText.includes('offers') || rawText.includes('catalog')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.OFFERS;
    }
    else if (rawText.includes('settings') || rawText.includes('config')) {
      cmd.type = 'NAVIGATE';
      cmd.payload = View.SETTINGS;
    }

    if (this.onCommandCallback) {
      this.onCommandCallback(cmd);
    }
  }
}

export const voiceService = new VoiceService();

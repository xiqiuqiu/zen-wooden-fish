class AudioService {
  private context: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;

  constructor() {
    // Initialize on first user interaction to comply with browser policies
  }

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public playKnock() {
    this.init();
    if (!this.context) return;

    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    // Wood block synthesis
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    // Filter to create "hollow" sound
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.value = 1.5;

    // Envelope (Short attack, quick decay)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }
}

export const audioService = new AudioService();

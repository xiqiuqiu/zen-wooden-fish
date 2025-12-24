

import { WOODEN_FISH_AUDIO_URL } from '../constants';

const CACHE_NAME = 'zen-audio-cache-v1';

class AudioService {
  private context: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private audioData: ArrayBuffer | null = null;
  private isDocsHidden = false;

  constructor() {
    // Preload the audio file immediately when the app loads
    this.preloadAudio();
  }

  // Fetch the raw file bytes immediately (doesn't require User Gesture)
  private async preloadAudio() {
    try {
      // 1. Try to load from Browser Cache first
      if ('caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(WOODEN_FISH_AUDIO_URL);

          if (cachedResponse) {
            console.log('Audio loaded from Browser Cache');
            this.audioData = await cachedResponse.arrayBuffer();
            return; // Exit early if cache hit
          }
        } catch (e) {
          console.warn("Cache API access failed, falling back to network", e);
        }
      }

      // 2. Fetch from Network if not in cache
      console.log('Fetching audio from Network...');
      const response = await fetch(WOODEN_FISH_AUDIO_URL);
      
      if (response.ok) {
        // 3. Save to Cache for next time
        if ('caches' in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            // We must clone the response because the body stream can only be consumed once
            cache.put(WOODEN_FISH_AUDIO_URL, response.clone()); 
            console.log('Audio saved to Browser Cache');
          } catch (e) {
            console.warn("Failed to write to cache", e);
          }
        }
        
        this.audioData = await response.arrayBuffer();
        
      } else {
        console.warn("Audio fetch failed:", response.statusText);
      }
    } catch (error) {
      console.warn("Failed to preload audio file:", error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if it was suspended (common in browsers)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // If we have downloaded data but haven't decoded it yet, do it now.
    // decodeAudioData requires the Context to be ready.
    if (this.audioData && !this.buffer) {
      // slice(0) clones the buffer to prevent detaching the original source if we needed it again,
      // though here it's mostly a safety habit.
      this.context.decodeAudioData(this.audioData.slice(0), (decoded) => {
        this.buffer = decoded;
      }, (e) => {
        console.warn("Audio decode error:", e instanceof Error ? e.message : 'Decode failed');
      });
    }
  }

  public playKnock() {
    this.init();
    if (!this.context) return;

    // 1. Try to play the loaded audio file (Buffer)
    if (this.buffer) {
      const source = this.context.createBufferSource();
      source.buffer = this.buffer;
      
      // The sample from JSDelivr is usually quite natural, maybe slightly high pitched.
      // Adjust slightly if needed. 1.0 is natural speed.
      source.playbackRate.value = 1.0; 

      const gainNode = this.context.createGain();
      gainNode.gain.value = 1.0;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      source.start(0);
      return;
    }

    // 2. Fallback: HTML Audio Element (for CORS issues where fetch fails but direct link works)
    // This is a backup for when fetch/cache completely fails but we still want sound.
    // Note: This logic is skipped if we entered the block above, so we only use this if no buffer.
    if (!this.audioData) {
        // Try creating an audio element on the fly
        const audio = new Audio(WOODEN_FISH_AUDIO_URL);
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(e => {
            // If even that fails, use Synthesis
            this.playSynthFallback();
        });
        return;
    }

    // 3. Fallback: Synthesis (Last resort)
    this.playSynthFallback();
  }

  private playSynthFallback() {
    if (!this.context) return;
    
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    // Improved synth settings for a "woodier" sound
    osc.type = 'sine'; // Sine is smoother than triangle
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

    // Filter to create "hollow" body resonance
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.value = 1;

    // Envelope (Short click)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export const audioService = new AudioService();
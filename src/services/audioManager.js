// Pre-configured audio asset map ready for drop-in MP3 files
export const SOUND_REGISTRY = {
  // AI Ref Taunts
  PAVANAYI: { id: "pavanayi", label: "Pavanayi Shavamayi", file: "/assets/audio/pavanayi.mp3" },
  ENTHOKKE: { id: "enthokke", label: "Enthokke Aayirunnu", file: "/assets/audio/enthokke.mp3" },
  VIDHIKKAN: { id: "vidhikkan", label: "Vidhikkan Njan Aaru", file: "/assets/audio/vidhikkan.mp3" },
  SCENE_CONTRA: { id: "scene_contra", label: "Scene Contra", file: "/assets/audio/scene_contra.mp3" },
  DHA_POYI: { id: "dha_poyi", label: "Dha Dha Poyi", file: "/assets/audio/dha_poyi.mp3" },
  SADHANAM: { id: "sadhanam", label: "Sadhanam Kayyilundo", file: "/assets/audio/sadhanam.mp3" }
};

class AudioManager {
  constructor() {
    this.isMuted = false;
    this.volume = 1.0;
    this.audioCache = {};
    
    // Preload audio elements
    Object.values(SOUND_REGISTRY).forEach(sound => {
      const audio = new Audio(sound.file);
      audio.volume = this.volume;
      this.audioCache[sound.id] = audio;
    });
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.audioCache).forEach(audio => {
      audio.volume = this.volume;
    });
  }

  play(soundId) {
    if (this.isMuted) return;

    const audio = this.audioCache[soundId];
    if (audio) {
      // Clone the node so we can play overlapping sounds if triggered rapidly
      const clone = audio.cloneNode();
      clone.volume = this.volume;
      
      // Attempt to play, fail silently if file missing or browser blocks autoplay
      clone.play().catch(e => {
        console.warn(`AudioManager: Failed to play sound ${soundId}`, e);
      });
    } else {
      console.warn(`AudioManager: Sound ID ${soundId} not found in registry.`);
    }
  }
}

export const audioManager = new AudioManager();

import { useCallback } from 'react';

const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  scroll: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3',
  dice: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3',
  notification: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  note1: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  note2: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  note3: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  note4: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
};

// Global cache to avoid re-preloading on every mount
const globalAudioCache: Record<string, HTMLAudioElement> = {};

// Initialize global cache if in browser
if (typeof window !== 'undefined') {
  Object.entries(SOUND_URLS).forEach(([name, url]) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    globalAudioCache[name] = audio;
  });
}

export const useSound = () => {
  const playSound = useCallback((soundName: keyof typeof SOUND_URLS) => {
    try {
      console.log(`[Sound] Playing: ${soundName}`);
      const audio = globalAudioCache[soundName];
      if (audio) {
        // Reset and play
        audio.currentTime = 0;
        audio.volume = 0.6; // Increased volume further
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn(`[Sound] Playback failed for ${soundName}:`, err);
            // Fallback: try creating a fresh instance
            const fallback = new Audio(SOUND_URLS[soundName]);
            fallback.volume = 0.6;
            fallback.play().catch(() => {});
          });
        }
      }
    } catch (err) {
      console.error('[Sound] Error:', err);
    }
  }, []);

  return { playSound };
};

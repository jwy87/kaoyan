import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, Github } from 'lucide-react';
import { GITHUB_URL, MUSIC_URL } from '../constants';

interface BackgroundMusicProps {
  shouldPlay: boolean;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ shouldPlay }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackRef = useRef<{
    ctx: AudioContext;
    gain: GainNode;
    oscillators: OscillatorNode[];
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const DEFAULT_VOLUME = 0.05;
  // Intent: music should be enabled by default.
  // Reality: many browsers block unmuted autoplay until user interaction.
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    audio.volume = DEFAULT_VOLUME;
  }, [isMuted, DEFAULT_VOLUME]);

  useEffect(() => {
    if (shouldPlay) return;

    // When the app is not supposed to play music (e.g. intro), stop everything.
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const fallback = fallbackRef.current;
    if (fallback) {
      try {
        fallback.gain.gain.cancelScheduledValues(fallback.ctx.currentTime);
        fallback.gain.gain.setTargetAtTime(0.0001, fallback.ctx.currentTime, 0.02);
        fallback.oscillators.forEach(o => o.stop(fallback.ctx.currentTime + 0.05));
        fallback.ctx.close();
      } catch {
        // ignore
      }
      fallbackRef.current = null;
    }

    setIsFallback(false);
    setIsPlaying(false);
    setIsMuted(false);
  }, [shouldPlay]);

  useEffect(() => {
    // Only attempt auto-play if shouldPlay is true and no error
    if (shouldPlay && audioRef.current && !isPlaying && !hasError) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setNeedsInteraction(false);
          })
          .catch(err => {
            // Auto-play was prevented. This is expected in many browsers until user interaction.
            // We do not treat this as a fatal error.
            console.log("Autoplay prevented (waiting for user interaction).");
            setIsPlaying(false);
            // Don't show "sound on" when nothing is playing.
            setIsMuted(true);
            setNeedsInteraction(true);
          });
      }
    }
  }, [shouldPlay, isPlaying, hasError]);

  useEffect(() => {
    if (!shouldPlay || hasError || isFallback || !needsInteraction) return;

    const tryResume = async () => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.volume = DEFAULT_VOLUME;
        audio.muted = false;
        await audio.play();
        setIsMuted(false);
        setIsPlaying(true);
        setNeedsInteraction(false);
      } catch {
        // Still blocked; keep waiting.
      }
    };

    // One-time global gesture handler: click/tap/key triggers playback.
    const handler = () => {
      void tryResume();
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handler as any);
      window.removeEventListener('keydown', handler as any);
    };
  }, [shouldPlay, hasError, isFallback, needsInteraction, DEFAULT_VOLUME]);

  const startFallback = async () => {
    if (fallbackRef.current) return;

    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!AudioCtx) {
      console.warn('WebAudio not supported in this browser.');
      return;
    }

    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(ctx.destination);

    // Simple, gentle chord (generated locally; avoids network/CDN restrictions).
    const freqs = [220, 277.18, 329.63]; // A3, C#4, E4
    const oscillators = freqs.map(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();
      return osc;
    });

    // Fade in softly.
    // Map DEFAULT_VOLUME (0..1) to a comfortable gain.
    gain.gain.setTargetAtTime(0.06 * DEFAULT_VOLUME, ctx.currentTime, 0.15);

    fallbackRef.current = { ctx, gain, oscillators };
    setIsFallback(true);
    setIsPlaying(true);
    setIsMuted(false);
    setNeedsInteraction(false);
  };

  const stopFallback = async () => {
    const fallback = fallbackRef.current;
    if (!fallback) return;
    try {
      fallback.gain.gain.cancelScheduledValues(fallback.ctx.currentTime);
      fallback.gain.gain.setTargetAtTime(0.0001, fallback.ctx.currentTime, 0.05);
      fallback.oscillators.forEach(o => o.stop(fallback.ctx.currentTime + 0.1));
      await fallback.ctx.close();
    } catch {
      // ignore
    }
    fallbackRef.current = null;
    setIsFallback(false);
    setIsPlaying(false);
    setIsMuted(true);
  };

  const toggleSound = async () => {
    // If remote audio fails (common in some networks), fall back to local WebAudio.
    if (hasError) {
      if (fallbackRef.current) {
        await stopFallback();
      } else {
        await startFallback();
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      await startFallback();
      return;
    }

    // If user clicks while we were blocked, treat this as "enable sound".
    if (needsInteraction) {
      try {
        audio.volume = DEFAULT_VOLUME;
        audio.muted = false;
        await audio.play();
        setIsMuted(false);
        setIsPlaying(true);
        setNeedsInteraction(false);
      } catch (err: any) {
        console.warn("Manual play failed:", err?.message || err);
        await startFallback();
      }
      return;
    }

    // If audio isn't playing yet, a click should try to START playback first
    // (otherwise users need to click "off" then "on" to get sound).
    if (audio.paused) {
      try {
        audio.volume = DEFAULT_VOLUME;
        audio.muted = false;
        await audio.play();
        setIsMuted(false);
        setIsPlaying(true);
      } catch (err: any) {
        console.warn("Manual play failed:", err?.message || err);
        await startFallback();
      }
      return;
    }

    // If currently muted, unmute (keep playing).
    if (audio.muted || isMuted) {
      audio.muted = false;
      setIsMuted(false);
      setIsPlaying(true);
      return;
    }

    // Otherwise, mute.
    audio.muted = true;
    setIsMuted(true);
    setIsPlaying(false);
    return;
  };

  const buttonClassName = (() => {
    if (hasError) {
      // Network/CDN blocked: WebAudio fallback available on click.
      if (isFallback) {
        return 'p-2 rounded-full backdrop-blur-md transition-all shadow-md ring-1 ' +
          'bg-white/80 text-indigo-700 hover:bg-white/90 ring-indigo-500/20';
      }
      return 'p-2 rounded-full backdrop-blur-md transition-all shadow-sm ring-1 ' +
        'bg-white/55 text-slate-800 hover:bg-white/70 ring-slate-900/10';
    }
    if (needsInteraction || isMuted) {
      return 'p-2 rounded-full backdrop-blur-md transition-all shadow-sm ring-1 ' +
        'bg-white/40 text-slate-700 hover:bg-white/60 ring-slate-900/10';
    }
    // Sound ON: make it noticeably different.
    return 'p-2 rounded-full backdrop-blur-md transition-all shadow-md ring-1 ' +
      'bg-white/80 text-indigo-700 hover:bg-white/90 ring-indigo-500/20';
  })();

  const isSoundOn = !hasError && !needsInteraction && !isMuted && isPlaying;
  const isSoundOff = !hasError && (needsInteraction || isMuted || !isPlaying);

  const githubButtonClassName =
    'p-2 rounded-full backdrop-blur-md transition-all shadow-sm ring-1 ' +
    'bg-white/40 text-slate-700 hover:bg-white/60 ring-slate-900/10';

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <audio 
        ref={audioRef} 
        src={MUSIC_URL} 
        loop 
        preload="auto"
        playsInline
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio) return;
          audio.volume = DEFAULT_VOLUME;
        }}
        onError={() => {
            // FIX: Do not log the event 'e' directly as it contains circular references to the DOM
            console.warn("Audio source failed to load. Music disabled.");
            setHasError(true);
            setIsPlaying(false);
            // Allow fallback button to start local sound.
            setIsMuted(true);
            setNeedsInteraction(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer noopener"
        className={githubButtonClassName}
        title="GitHub"
        aria-label="GitHub"
      >
        <Github className="w-6 h-6" />
      </a>

      <button
        onClick={toggleSound}
        className={buttonClassName}
        title={
          hasError
            ? (isFallback ? '关闭音乐（本地音色）' : '开启音乐（本地音色）')
            : (needsInteraction || !isPlaying ? '点击开启音乐' : (isMuted ? '开启音乐' : '静音'))
        }
      >
        {hasError ? (
          isFallback ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Music className="w-6 h-6" />
        ) : isSoundOff ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className={isSoundOn ? "w-6 h-6 animate-pulse" : "w-6 h-6"} />
        )}
      </button>
    </div>
  );
};

export default BackgroundMusic;
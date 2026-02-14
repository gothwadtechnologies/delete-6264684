
import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  url?: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || url.trim() === '') {
      setVideoId(null);
      setError("No video URL provided.");
      return;
    }

    const extractId = (rawUrl: string): string | null => {
      const cleanUrl = rawUrl.trim();
      let id: string | null = null;

      try {
        if (cleanUrl.includes('youtu.be/')) {
          const parts = cleanUrl.split('youtu.be/');
          if (parts[1]) id = parts[1].split('?')[0].substring(0, 11);
        } else if (cleanUrl.includes('v=')) {
          const parts = cleanUrl.split('v=');
          const potentialId = parts[1]?.substring(0, 11);
          if (potentialId) id = potentialId;
        } else if (cleanUrl.includes('/shorts/')) {
          const parts = cleanUrl.split('/shorts/');
          if (parts[1]) id = parts[1].substring(0, 11);
        } else if (cleanUrl.includes('/embed/')) {
          const parts = cleanUrl.split('/embed/');
          if (parts[1]) id = parts[1].substring(0, 11);
        }

        if (!id || id.length !== 11) {
          const match = cleanUrl.match(/[a-zA-Z0-9_-]{11}/);
          if (match) id = match[0];
        }
      } catch (e) {
        return null;
      }

      const isValid = id && /^[a-zA-Z0-9_-]{11}$/.test(id);
      return isValid ? id : null;
    };

    const foundId = extractId(url);
    if (foundId) {
      setVideoId(foundId);
      setError(null);
    } else {
      setVideoId(null);
      setError("Invalid YouTube Link. Please update in Manage.");
    }
  }, [url]);

  /**
   * PW-STYLE SMART EMBED:
   * 1. origin: Browser's current location ensure restricted playback inside our frame.
   * 2. playsinline: 1 (CRITICAL) - Prevents auto-fullscreen or app-launching.
   * 3. enablejsapi: 1 - Allows internal messaging for video state.
   * 4. modestbranding: 1 - Removes large YT logo to avoid accidental clicks that open the YT app.
   */
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(origin)}&playsinline=1&rel=0&modestbranding=1&widget_referrer=${encodeURIComponent(origin)}`
    : null;

  return (
    <div className="w-full aspect-video bg-black rounded-b-2xl overflow-hidden relative shadow-2xl border-b border-gray-100 group">
      {embedUrl ? (
        <iframe
          key={videoId} 
          className="w-full h-full"
          src={embedUrl}
          title={title || "Lecture Video"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-950">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-inner">
            <span className="text-3xl grayscale opacity-50">🎬</span>
          </div>
          <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            Secure Video Player
          </h4>
          <p className="text-red-400 text-[9px] font-bold uppercase tracking-widest leading-relaxed max-w-[240px] px-4 py-2 bg-red-400/10 rounded-lg">
            {error || "Standby: Authenticating Stream..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

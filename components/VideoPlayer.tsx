
import React, { useState, useEffect, useRef } from 'react';

// Declaring the YouTube YT object on the window for TypeScript support
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface VideoPlayerProps {
  url?: string;
  title?: string;
}

/**
 * A robust YouTube Video Player component that handles the YouTube IFrame API.
 * This fixes the default export issue and provides actual playback functionality.
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  // Extract YouTube ID from various URL formats (standard, short, embed)
  useEffect(() => {
    if (!url) {
      setVideoId(null);
      return;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    
    if (id) {
      setVideoId(id);
      setError(null);
    } else {
      setVideoId(null);
      setError("Invalid YouTube URL provided");
    }
  }, [url]);

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    if (!videoId) return;

    const loadAPI = () => {
      // Check if API is already loaded or script exists
      if (!window.YT) {
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          }
        }

        window.onYouTubeIframeAPIReady = () => {
          createPlayer();
        };
      } else {
        createPlayer();
      }
    };

    const createPlayer = () => {
      // Destroy previous instance if it exists to prevent memory leaks and container conflicts
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.error("Error destroying player:", e);
        }
      }

      // Check if container exists before creating player
      const containerId = `youtube-player-${videoId}`;
      const container = document.getElementById(containerId);
      if (!container) return;

      playerRef.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          autoplay: 0,
        },
        events: {
          onError: () => {
            setError("Could not load the video. It might be restricted or private.");
          }
        },
      });
    };

    loadAPI();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {}
      }
    };
  }, [videoId]);

  return (
    <div className="w-full aspect-video bg-black relative group overflow-hidden shadow-2xl">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <span className="text-4xl mb-3">⚠️</span>
          <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Playback Error</p>
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : videoId ? (
        <div id={`youtube-player-${videoId}`} className="w-full h-full" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center opacity-40">
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Player...</p>
        </div>
      )}
      
      {/* Overlay Title bar */}
      {title && !error && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <h3 className="text-white text-[10px] font-black uppercase tracking-tight truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

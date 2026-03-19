
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
 * A simple YouTube Video Player component that handles the YouTube IFrame API.
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);

  // Extract YouTube ID from various URL formats
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
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.error("Error destroying player:", e);
        }
      }

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
          controls: 1, // Show standard YouTube controls
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
    <div className="w-full h-full bg-black relative overflow-hidden">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900 z-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-2">Playback Error</p>
          <p className="text-xs font-bold text-slate-300 max-w-[200px] leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Retry
          </button>
        </div>
      ) : videoId ? (
        <div className="w-full h-full">
          <div id={`youtube-player-${videoId}`} className="w-full h-full" />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center bg-slate-900 z-50">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 text-blue-400">Loading Player</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

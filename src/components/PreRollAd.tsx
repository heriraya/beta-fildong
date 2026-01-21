import { useState, useEffect, useRef, useCallback } from "react";
import { X, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADS_CONFIG } from "@/lib/ads-config";

interface PreRollAdProps {
  onComplete: () => void;
}

export const PreRollAd = ({ onComplete }: PreRollAdProps) => {
  const [countdown, setCountdown] = useState(ADS_CONFIG.skipDelaySeconds);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Jika iklan tidak diaktifkan, langsung complete
  useEffect(() => {
    if (!ADS_CONFIG.enabled) {
      onComplete();
    }
  }, [onComplete]);

  // Countdown timer
  useEffect(() => {
    if (!ADS_CONFIG.enabled || hasError) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasError]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (canSkip || hasError) {
      onComplete();
    }
  }, [canSkip, hasError, onComplete]);

  // Handle click on video (buka link di tab baru)
  const handleVideoClick = useCallback(() => {
    if (ADS_CONFIG.clickUrl) {
      window.open(ADS_CONFIG.clickUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Handle video error
  const handleVideoError = useCallback(() => {
    console.error("[PreRollAd] Video failed to load:", ADS_CONFIG.videoUrl);
    setHasError(true);
    // Auto-skip setelah 2 detik jika error
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, [onComplete]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  // Jika tidak aktif, render nothing (sudah di-handle di useEffect)
  if (!ADS_CONFIG.enabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 bg-black flex items-center justify-center">
      {/* Video Iklan */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={handleVideoClick}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={ADS_CONFIG.videoUrl}
          autoPlay
          muted={isMuted}
          playsInline
          onCanPlay={() => setIsVideoReady(true)}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          className="w-full h-full object-contain"
        />

        {/* Loading Overlay */}
        {!isVideoReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/70 text-sm">Memuat iklan...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <p className="text-white/70 text-sm">Iklan tidak dapat dimuat</p>
              <p className="text-white/50 text-xs mt-1">Melanjutkan ke video utama...</p>
            </div>
          </div>
        )}

        {/* Click Indicator */}
        {isVideoReady && !hasError && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/80 text-sm bg-black/50 px-3 py-1.5 rounded-full pointer-events-none">
            <ExternalLink className="w-4 h-4" />
            <span>Klik untuk info lebih lanjut</span>
          </div>
        )}

        {/* Ad Label */}
        <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
          IKLAN
        </div>

        {/* Mute/Unmute Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-3 left-3 w-10 h-10 bg-black/70 hover:bg-black/90"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </Button>

        {/* Skip Button / Countdown */}
        <div className="absolute top-3 right-3">
          {canSkip ? (
            <Button
              variant="secondary"
              size="sm"
              className="bg-black/70 hover:bg-black/90 text-white gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
            >
              <X className="w-4 h-4" />
              {ADS_CONFIG.skipButtonText}
            </Button>
          ) : (
            <div className="bg-black/70 text-white text-sm px-3 py-2 rounded-md">
              {ADS_CONFIG.countdownText.replace("{seconds}", String(countdown))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";

import { Lock, Share2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isUnlocked, setUnlocked, getShareUrl } from "@/lib/share-unlock";

// Social media icons
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const CONFIRM_WAIT_SECONDS = 8;

interface ShareUnlockProps {
  delaySeconds?: number;
  onUnlock?: () => void;
}

export const ShareUnlock = ({ delaySeconds = 120, onUnlock }: ShareUnlockProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  // Mulai dengan false, biarkan useEffect yang mengecek status unlock dari localStorage
  const [unlocked, setUnlockedState] = useState(() => isUnlocked());
  const [shareClicked, setShareClicked] = useState(false);
  const [countdown, setCountdown] = useState(CONFIRM_WAIT_SECONDS);
  const [canConfirm, setCanConfirm] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if already unlocked
    if (isUnlocked()) {
      setUnlockedState(true);
      setShowOverlay(false);
      return;
    }

    setUnlockedState(false);

    // Show overlay after delay
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  // Countdown timer after share clicked
  useEffect(() => {
    if (shareClicked && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (shareClicked && countdown === 0) {
      setCanConfirm(true);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [shareClicked, countdown]);

  const handleShareClick = (platform: "whatsapp" | "facebook" | "twitter") => {
    const url = getShareUrl();
    const text = "Watch free movies and series on Film Dong! 🎬";
    
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
    }
    
    // Start confirmation flow
    setShareClicked(true);
  };

  const handleConfirm = () => {
    setUnlocked();
    setUnlockedState(true);
    setShowOverlay(false);
    onUnlock?.();
  };

  if (unlocked || !showOverlay) return null;

  return (
    <div className="absolute inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        {!shareClicked ? (
          <>
            {/* Lock Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Lock className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Unlock to Continue for Free
            </h2>
            <p className="text-gray-400 mb-2">
              Buka kunci untuk melanjutkan streaming gratis
            </p>

            {/* Share instruction */}
            <div className="flex items-center justify-center gap-2 text-primary mb-6">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share our website to unlock</span>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button
                onClick={() => handleShareClick("whatsapp")}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2 px-5"
                size="lg"
              >
                <WhatsAppIcon />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShareClick("facebook")}
                className="bg-[#1877F2] hover:bg-[#0d65d9] text-white flex items-center gap-2 px-5"
                size="lg"
              >
                <FacebookIcon />
                Facebook
              </Button>
              <Button
                onClick={() => handleShareClick("twitter")}
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2 px-5 border border-gray-700"
                size="lg"
              >
                <TwitterIcon />
                Twitter
              </Button>
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-500">
              Akses akan terbuka selama 24 jam setelah berbagi
              <br />
              <span className="text-gray-600">Access unlocked for 24 hours after sharing</span>
            </p>
          </>
        ) : (
          <>
            {/* Confirmation Step */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              {canConfirm ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {canConfirm ? "Share Completed?" : "Waiting for Share..."}
            </h2>
            <p className="text-gray-400 mb-4">
              {canConfirm 
                ? "Klik tombol di bawah untuk membuka akses" 
                : "Silakan selesaikan share di jendela yang terbuka"}
            </p>

            {!canConfirm && (
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{countdown}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tunggu {countdown} detik...
                </p>
              </div>
            )}

            {canConfirm && (
              <Button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Saya Sudah Share / I've Shared
              </Button>
            )}

            <p className="text-xs text-gray-600 mt-4">
              Tombol akan aktif setelah Anda menyelesaikan share
            </p>
          </>
        )}
      </div>
    </div>
  );
};

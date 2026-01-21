import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Ganti dengan ID tracking Anda
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Google Analytics 4
const HISTATS_ID = "0000000"; // Histats ID

export function Analytics() {
  useEffect(() => {
    // Google Analytics 4
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX") {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID);
    }

    // Histats
    if (HISTATS_ID && HISTATS_ID !== "0000000") {
      const histatsScript = document.createElement("script");
      histatsScript.type = "text/javascript";
      histatsScript.innerHTML = `
        var _Hasync= _Hasync|| [];
        _Hasync.push(['Histats.start', '1,${HISTATS_ID},4,0,0,0,00010000']);
        _Hasync.push(['Histats.f498teleHit', '']);
        _Hasync.push(['Histats.track_hits', '']);
        (function() {
          var hs = document.createElement('script'); 
          hs.type = 'text/javascript'; 
          hs.async = true;
          hs.src = ('//s10.histats.com/js15_as.js');
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
        })();
      `;
      document.body.appendChild(histatsScript);
    }
  }, []);

  return null; // Komponen ini tidak render apapun
}

// Untuk menampilkan counter Histats (opsional)
export function HistatsCounter() {
  return (
    <div className="histats-counter">
      <a href="https://www.histats.com" target="_blank" rel="noopener noreferrer">
        <img 
          src={`https://sstatic1.histats.com/0.gif?${HISTATS_ID}&101`}
          alt="web counter"
          style={{ border: 0 }}
        />
      </a>
      <noscript>
        <a href="https://www.histats.com" target="_blank" rel="noopener noreferrer">
          <img 
            src={`https://sstatic1.histats.com/0.gif?${HISTATS_ID}&101`}
            alt="counter for tumblr"
            style={{ border: 0 }}
          />
        </a>
      </noscript>
    </div>
  );
}

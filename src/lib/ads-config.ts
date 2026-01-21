/**
 * ====================================
 * KONFIGURASI IKLAN PRE-ROLL
 * ====================================
 * 
 * Ubah nilai-nilai di bawah ini untuk mengatur iklan pre-roll.
 * Iklan akan muncul sebelum video utama dimainkan.
 */

export const ADS_CONFIG = {
  // URL video iklan (format: MP4)
  // Ganti dengan URL video iklan Anda
  videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  
  // URL tujuan ketika iklan diklik (buka di tab baru)
  // Ganti dengan URL landing page iklan Anda
  clickUrl: "https://example.com/promo",
  
  // Durasi dalam detik sebelum tombol "Skip" muncul
  // Minimum: 3 detik, Default: 10 detik
  skipDelaySeconds: 10,
  
  // Apakah iklan pre-roll diaktifkan?
  // Set false untuk menonaktifkan sementara
  enabled: true,
  
  // Teks tombol skip (dalam Bahasa Indonesia)
  skipButtonText: "Lewati Iklan",
  
  // Teks countdown sebelum skip tersedia
  // {seconds} akan diganti dengan angka countdown
  countdownText: "Lewati dalam {seconds}s",
};

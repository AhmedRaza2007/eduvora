'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Sparkles,
  ArrowRight,
  Clock,
  Film,
  MonitorPlay,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(35);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize playback state
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(err => {
        console.warn('Autoplay/play failed:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.8);
      videoRef.current.volume = 0.8;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
    videoRef.current.muted = val === 0;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls when playing and inactive
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section id="discover" className="py-24 border-t border-slate-900 bg-slate-950/90 relative overflow-hidden">
      {/* Ambient Radial Lights */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Official Platform Showcase
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Discover <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Eduvora</span> in 35 Seconds
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            See how Eduvora transforms fragmented school and college administration into one automated, multi-tenant cloud platform — featuring 8-tab student profiles, smart attendance, native PKR fee vouchers, and isolated campus governance.
          </p>
        </div>

        {/* Video Player Card */}
        <div className="max-w-5xl mx-auto">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-950/40 aspect-video select-none"
          >
            {/* HTML5 Native Video Tag */}
            <video
              ref={videoRef}
              playsInline
              preload="metadata"
              poster="/video_thumbnail.jpg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsPlaying(false);
                setHasStarted(false);
                setShowControls(true);
              }}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer bg-black"
            >
              <source src="/Eduvora-Promotional-Video.mp4" type="video/mp4" />
              <source src="/eduvora-launch-video.webm" type="video/webm" />
              Your browser does not support HTML5 video playback.
            </video>

            {/* Custom Poster / Initial Play Overlay */}
            {!hasStarted && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-950/20"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-2xl shadow-indigo-500/50 hover:scale-110 transition-transform flex items-center justify-center group/btn">
                  <div className="w-full h-full rounded-full bg-slate-950/50 flex items-center justify-center backdrop-blur-sm group-hover/btn:bg-slate-950/30 transition-colors">
                    <Play className="w-9 h-9 sm:w-11 sm:h-11 text-white fill-white translate-x-0.5" />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-lg sm:text-xl font-extrabold text-white tracking-tight drop-shadow-md">
                    Watch Platform Launch Video
                  </p>
                  <p className="text-xs sm:text-sm text-indigo-300 font-medium mt-1 flex items-center justify-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> 35 Seconds • 1080p Full HD • Sound On
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Player Controls Bar */}
            <div
              className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-3 ${
                showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Progress Bar / Scrubber */}
              <div
                onClick={handleSeek}
                className="relative h-2 w-full bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all group/scrub overflow-hidden"
              >
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-[width] duration-75"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                {/* Left Controls: Play/Pause, Volume, Time */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-20 accent-indigo-500 h-1.5 cursor-pointer bg-white/20 rounded-lg"
                    />
                  </div>

                  <span className="font-mono text-xs sm:text-sm text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls: Fullscreen */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/10 text-[11px] font-bold text-indigo-300">
                    1080p HD
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row: Real Download Button + Explore CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Eduvora Official Promotional Video</h4>
                <p className="text-xs text-slate-400">1080p High-Definition MP4 Video (35s • 3.5 MB)</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Real Video Download Button */}
              <a
                href="/Eduvora-Promotional-Video.mp4"
                download="Eduvora-Promotional-Video.mp4"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-md group"
              >
                <Download className="w-4 h-4 text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
                Download Video (.mp4)
              </a>

              {/* Primary Application CTA */}
              <Link
                href="/dashboard"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/30"
              >
                Explore Eduvora <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Value Badges Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Multi-Tenant Isolation', desc: 'Independent School & Campus Data' },
              { label: 'Native PKR (Rs.) Support', desc: 'Vouchers & Receipts in Pakistani Rupees' },
              { label: '7 Specialized RBAC Roles', desc: 'Super Admin, Teachers, Parents & More' },
              { label: 'Zero Legacy Friction', desc: 'Instant Dark Mode & Modern Next.js SaaS' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {badge.label}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

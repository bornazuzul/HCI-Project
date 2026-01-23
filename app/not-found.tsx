"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [bubbles, setBubbles] = useState<
    { id: number; x: number; size: number }[]
  >([]);

  // Generate cleaning bubbles
  useEffect(() => {
    const newBubbles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      size: Math.random() * 10 + 5,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        {/* Icon / Illustration */}
        <div className="mx-auto mt-6 mb-6 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center relative overflow-visible">
          <Search className="w-10 h-10 text-blue-600 relative z-10" />
          {/* Animated search ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-75"></div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Page not found
        </h1>

        {/* Cute Cleaning Animation */}
        <div className="relative h-48 mb-8 flex items-center justify-center">
          {/* Background cleaning area */}
          <div className="absolute bottom-0 w-48 h-20 bg-gradient-to-t from-green-100 to-emerald-50 rounded-t-2xl border border-emerald-200"></div>

          {/* Cute volunteer character */}
          <div className="relative z-20 animate-bounce-slow">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              {/* Body */}
              <rect
                x="40"
                y="50"
                width="40"
                height="40"
                rx="8"
                fill="#3B82F6"
              />

              {/* Head */}
              <circle cx="60" cy="40" r="20" fill="#FBBF24" />

              {/* Broom - animated sweeping */}
              <g className="animate-sweep origin-bottom">
                {/* Broom handle */}
                <rect
                  x="72"
                  y="50"
                  width="4"
                  height="50"
                  rx="2"
                  fill="#92400E"
                />
                {/* Broom head */}
                <rect
                  x="58"
                  y="95"
                  width="20"
                  height="8"
                  rx="2"
                  fill="#78716C"
                />
                {/* Broom bristles */}
                <path d="M58 103 L58 115 L78 115 L78 103 Z" fill="#A8A29E" />
              </g>

              {/* Arms - one holding broom */}
              <path
                d="M70 55 L85 70"
                stroke="#3B82F6"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M50 55 L40 65"
                stroke="#3B82F6"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Face - cute expression */}
              <circle
                cx="52"
                cy="35"
                r="2.5"
                fill="#1F2937"
                className="animate-blink"
              />
              <circle
                cx="68"
                cy="35"
                r="2.5"
                fill="#1F2937"
                className="animate-blink"
                style={{ animationDelay: "0.5s" }}
              />
              <path
                d="M52 45 Q60 52 68 45"
                stroke="#DC2626"
                strokeWidth="2"
                fill="none"
              />

              {/* Volunteer badge */}
              <circle cx="45" cy="48" r="8" fill="#EF4444" />
              <Heart
                className="w-4 h-4 text-white absolute"
                x="41"
                y="44"
                fill="white"
              />

              {/* Shoes */}
              <rect x="38" y="88" width="12" height="4" rx="2" fill="#1F2937" />
              <rect x="70" y="88" width="12" height="4" rx="2" fill="#1F2937" />
            </svg>
          </div>

          {/* Floating cleaning bubbles */}
          {bubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="absolute bottom-12 animate-float"
              style={{
                left: `${bubble.x}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                animationDelay: `${bubble.id * 0.3}s`,
                animationDuration: `${3 + bubble.id * 0.5}s`,
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 opacity-80"></div>
            </div>
          ))}

          {/* Little trash pile being cleaned */}
          <div className="absolute bottom-4 left-1/3 animate-shrink">
            <svg width="30" height="20" viewBox="0 0 30 20">
              {/* Paper */}
              <path
                d="M5 10 L8 5 L12 8 L15 3 L18 7 L22 5 L25 10 Z"
                fill="#D1D5DB"
                opacity="0.7"
              />
              {/* Leaf */}
              <path
                d="M20 12 Q22 8 24 12 Q22 16 20 12 Z"
                fill="#22C55E"
                opacity="0.8"
              />
              {/* Can */}
              <rect x="10" y="12" width="4" height="6" rx="1" fill="#6B7280" />
            </svg>
          </div>

          {/* Sparkles effect */}
          <div className="absolute top-4 right-12 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          </div>
          <div
            className="absolute top-8 left-12 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-300"></div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8 text-lg">
          Sorry, we couldn't find the page you're looking for. It may have been
          moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>

          <Link
            href="/activities"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition hover:scale-105 active:scale-95 group"
          >
            <Heart
              className="w-4 h-4 group-hover:animate-pulse"
              fill="currentColor"
            />
            Browse activities
          </Link>
        </div>

        {/* Add custom animations */}
        <style jsx global>{`
          @keyframes bounce-slow {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-60px) translateX(10px);
              opacity: 0;
            }
          }
          @keyframes sweep {
            0%,
            100% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(5deg);
            }
            50% {
              transform: rotate(0deg);
            }
            75% {
              transform: rotate(-5deg);
            }
          }
          @keyframes shrink {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(0.8);
              opacity: 0.8;
            }
          }
          @keyframes blink {
            0%,
            90%,
            100% {
              opacity: 1;
            }
            95% {
              opacity: 0.2;
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .animate-sweep {
            animation: sweep 2s ease-in-out infinite;
          }
          .animate-shrink {
            animation: shrink 3s ease-in-out infinite alternate;
          }
          .animate-blink {
            animation: blink 3s infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

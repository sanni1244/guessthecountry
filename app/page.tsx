"use client";

import React, { useState } from "react";
import Image from "next/image";
import "./globals.css";
import ReportCardsSection from "@/components/home/latestReport";
import StockCardsSection from "@/components/home/stockReport";
import { WatchlistCard } from "@/components/home/WatchlistCard";
import { HermesAlertsCard } from "@/components/home/HermesAlertsCard";
import { useAuth } from "@/components/api/user";
import { useTheme } from "@/components/theme/themeContext";
import GoogleOneTap from "@/components/static/GoogleOneTap";
import { useShowAds } from "@/components/ads/index";
import { cloudflareAdUrl } from "@/components/api/path";
import { useTranslations } from "next-intl";
import { ArrowUpLeft } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const showAds = useShowAds();
  const { bgPrimary, textPrimary } = useTheme();
  const t = useTranslations("Ads");

  const [searchActivated, setSearchActivated] = useState(false);

  const handleFocusHeaderSearch = () => {
    setSearchActivated(true);
    window.dispatchEvent(new Event("orion:focus-header-search"));
  };

  return (
    <div className={`min-h-screen ${bgPrimary} ${textPrimary} transition-colors duration-300 p-4 md:p-8`}>
      {!isLoading && !isAuthenticated && <GoogleOneTap />}

      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Spans 9 columns */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className={`rounded-xs ${bgPrimary}`}>
              <ReportCardsSection />
            </div>
            <div className={`rounded-xs ${bgPrimary}`}>
              <StockCardsSection />
            </div>
          </div>

          {/* Right Column: Spans 3 columns */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="hidden lg:block">
              {showAds ? (
                <div className="relative w-full rounded-xs overflow-hidden bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute inset-0">
                    <Image unoptimized src={`${cloudflareAdUrl}/v2-07.webp`} alt="Ad Banner" fill className="object-cover object-center" priority fetchPriority="high" />
                  </div>
                  <div className="relative z-10 p-4 space-y-2 text-white">
                    <h3 className="text-[28px] font-semibold leading-snug mb-4">Orion, Now Covering Japan</h3>
                    <p className="text-[16px] leading-relaxed opacity-95">300+ liquid Japanese leaders, now available to global investors</p>
                    <button type="button" onClick={handleFocusHeaderSearch} className="bg-white px-2 py-1 text-black rounded-md hover:bg-gray-200 transition-colors font-medium cursor-pointer">
                      {searchActivated ? (
                        <ArrowUpLeft
                          size={20}
                          strokeWidth={5}
                          className="rotate-350"
                          style={{
                            animation: "nudge-top-left 0.8s ease-in-out infinite",
                          }}
                        />
                      ) : (
                        "Browse Now"
                      )}
                    </button>
                    <style>{`
                      @keyframes nudge-top-left {
                        0%, 100% { transform: translate(0, 0); }
                        50% { transform: translate(-4px, -4px); }
                      }
                    `}</style>
                  </div>
                </div>
              ) : (
                <WatchlistCard locked={isLoading || !isAuthenticated} />
              )}
            </div>

            <div>
              <HermesAlertsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

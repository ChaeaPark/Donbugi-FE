"use client";

import { useApp } from "@/lib/app-context";
import { SectionHeader } from "@/components/shared/card";
import { Pill, HashTag, ProgressBar } from "@/components/shared/pill";
import { useEffect, useState } from "react";
import { articleApi } from "@/lib/api";

export function NewsScroll() {
  const { goToTab } = useApp();
const [newsItems, setNewsItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadLatestNews();
}, []);

const loadLatestNews = async () => {
  try {
    const data = await articleApi.getLatest(10);

    console.log("최신 뉴스", data);

    setNewsItems(data);
  } catch (error) {
    console.error("뉴스 조회 실패:", error);
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <SectionHeader
        title="📰 오늘의 뉴스"
        action="더보기 ›"
        onAction={() => goToTab("news")}
      />
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
        {newsItems.map((item) => (
          <div
            key={item.articleId}            className="min-w-[260px] bg-white/95 rounded-[20px] p-4 shadow-[0_2px_16px_rgba(60,60,120,0.10)] cursor-pointer transition-transform active:scale-[0.97]"
            style={{ borderTop: "3px solid #7C3AED" }}
            onClick={() => goToTab("news")}
          >
            <Pill color="#7C3AED" bgColor="#7C3AED1a">
                {item.category}
            </Pill>
            <div className="text-[15px] font-black text-[#1a1a2e] leading-[1.4] my-2">
              {item.title}
            </div>
            <div className="text-[13px] text-[#4a4a6a] leading-relaxed mb-2.5">
              {item.summary}
            </div>
            <div className="flex gap-1.5 flex-wrap mb-2.5">
              {item.tags?.map((tag) => (
                <HashTag key={tag}>#{tag}</HashTag>
              ))}
            </div>
            <div className="text-[11px] text-[#8888aa] flex justify-between mb-1">
              <span>
                😊 긍정 비율
              </span>

              <span
                className="font-bold"
                style={{ color: "#3CBBA2" }}
              >
                {item.sentimentPositivePercent || 0}%
              </span>
            </div>
            <ProgressBar
                percentage={item.sentimentPositivePercent || 0}
                negative={false}
              />
          </div>
        ))}
      </div>
    </>
  );
}

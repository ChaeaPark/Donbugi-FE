"use client";

import { useEffect, useState } from "react";
import { useApp, CHARS } from "@/lib/app-context";
import { getStoredUserId, pointApi, authApi } from "@/lib/api";

const earnItems = [
  {
    icon: "⚔️",
    title: "오늘의 과제 참여",
    desc: "오늘의 과제 문제 풀이시",
    points: "+20P",
    tag: "문제당",
  },
  {
    icon: "🎯",
    title: "오늘의 과제 전체 정답",
    desc: "3문제 모두 정답 시 보너스",
    points: "+20P",
    tag: "보너스",
  },
  {
    icon: "📰",
    title: "뉴스 5개 읽기",
    desc: "뉴스 상세 페이지 5개 이상 방문",
    points: "+20P",
    tag: "달성시",
  },
  {
    icon: "📖",
    title: "뉴스 10개 읽기",
    desc: "뉴스 상세 페이지 10개 이상 방문",
    points: "+40P",
    tag: "달성시",
  },
  {
    icon: "🧩",
    title: "뉴스 상세 퀴즈 참여",
    desc: "뉴스 상세 페이지 퀴즈 참여",
    points: "+20P",
    tag: "참여당",
  },
  {
    icon: "🔥",
    title: "연속 7일 출석 보너스",
    desc: "7일 연속 출석 달성 시",
    points: "+100P",
    tag: "보너스",
  },
];

// benefitCode → 아이콘 매핑
function getBenefitIcon(code) {
  const iconMap = {
    CONVENIENCE_DISCOUNT: "🏪",
    COFFEE_COUPON: "☕",
    DATA_COUPON: "📡",
    SHOPPING_DISCOUNT: "🛍️",
    OTT_VOUCHER: "🎬",
    CASH_BACK: "💳",
  };
  return iconMap[code] ?? "🎁";
}

export function ShopScreen() {
  const { userChar, setAlertPopOpen, setAlertPopData, toast } = useApp();
  const [activeTab, setActiveTab] = useState("earn");

  // 포인트 잔액 & 월간 요약
  const [balance, setBalance] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // 혜택 목록
  const [benefits, setBenefits] = useState([]);
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(true);

  // 교환 처리 중인 benefitCode
  const [redeemingCode, setRedeemingCode] = useState(null);

  const char = userChar || CHARS[0];

  const fetchPointInfo = async () => {
    const userId = getStoredUserId();
    if (!userId) {
      setIsLoadingBalance(false);
      return;
    }

    try {
      setIsLoadingBalance(true);
      const [balanceData, summaryData] = await Promise.allSettled([
        pointApi.getBalance(userId),
        pointApi.getMonthlySummary({ userId }),
      ]);

      if (balanceData.status === "fulfilled") {
        setBalance(balanceData.value);
      }
      if (summaryData.status === "fulfilled") {
        setMonthlySummary(summaryData.value);
      }
    } catch (error) {
      console.error("포인트 정보 조회 실패:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchBenefits = async () => {
    try {
      setIsLoadingBenefits(true);
      const data = await pointApi.getBenefits();
      setBenefits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("혜택 목록 조회 실패:", error);
    } finally {
      setIsLoadingBenefits(false);
    }
  };

  useEffect(() => {
    fetchPointInfo();
    fetchBenefits();
  }, []);

  const handleExchange = async (benefit) => {
    const userId = getStoredUserId();
    if (!userId) {
      toast?.("⚠️ 로그인 후 이용해주세요.");
      return;
    }

    const currentBalance = balance?.balance ?? 0;
    if (currentBalance < benefit.pointsRequired) {
      toast?.("⚠️ 포인트가 부족해요.");
      return;
    }

    try {
      setRedeemingCode(benefit.code);

      // 이메일은 authApi.getMe()에서 가져오거나 저장된 값 사용
      const me = await authApi.getMe();
      const email = me?.email ?? "";

      const result = await pointApi.redeem({
        userId,
        email,
        benefitCode: benefit.code,
      });

      // 잔액 갱신
      setBalance((prev) => ({
        ...prev,
        balance: result.balanceAfter,
      }));

      setAlertPopData({
        icon: getBenefitIcon(benefit.code),
        title: `${result.benefitName} 신청 완료!`,
        desc: `<strong>${result.pointsSpent}P</strong>가 차감되며,<br><br>${benefit.description}을(를) 이메일로 발송해드립니다.<br><br>📧 ${result.email}로 자동 발송됩니다.<br>발송까지 최대 24시간이 소요될 수 있어요.`,
      });
      setAlertPopOpen(true);
    } catch (error) {
      console.error("혜택 교환 실패:", error);
      toast?.(`⚠️ ${error.message || "교환에 실패했어요."}`);
    } finally {
      setRedeemingCode(null);
    }
  };

  // 혜택 목록을 인기(상위 2개)와 나머지로 분리
  const popularBenefits = benefits.slice(0, 2);
  const otherBenefits = benefits.slice(2);

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[220px] h-[220px] bg-[radial-gradient(circle,rgba(124,58,237,0.35),transparent_70%)] rounded-full" />
        <div className="absolute -bottom-10 -left-5 w-40 h-40 bg-[radial-gradient(circle,rgba(60,187,162,0.25),transparent_70%)] rounded-full" />

        <div className="px-5 pt-6 pb-5 relative z-10">
          <h1 className="text-[22px] font-black mb-1">🏪 포인트 상점</h1>
          <p className="text-[13px] opacity-75">
            활동으로 포인트를 모아 혜택으로 교환하세요
          </p>

          {/* Points Card */}
          <div className="bg-white/[0.08] border border-white/[0.12] rounded-[16px] p-4 mt-4 flex items-center justify-between backdrop-blur-[16px]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#ffd700] to-[#ffb300] rounded-xl flex items-center justify-center text-[22px] flex-shrink-0">
                🪙
              </div>
              <div>
                <div className="text-[11px] opacity-70 font-bold tracking-[0.5px]">
                  보유 포인트
                </div>
                <div className="text-[26px] font-black text-[#ffd700] leading-[1.1]">
                  {isLoadingBalance ? "…" : `${balance?.balance ?? 0}P`}
                </div>
                <div className="text-[11px] text-white/50 mt-[2px]">
                  이번 달 +{monthlySummary?.earnedPoints ?? 0}P 적립
                </div>
              </div>
            </div>
            <div className="bg-[rgba(60,187,162,0.2)] border border-[rgba(60,187,162,0.4)] rounded-[10px] py-1.5 px-3 text-center">
              <div className="text-sm font-black text-[#3CBBA2]">
                {char.lvLabel}
              </div>
              <div className="text-[10px] text-white/50">멤버십</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <button
          onClick={() => setActiveTab("earn")}
          className={`flex-1 py-3 px-1.5 rounded-none text-[12px] font-bold border-none border-b-2 cursor-pointer text-center transition-all bg-transparent ${
            activeTab === "earn"
              ? "text-[#7C3AED] border-b-[#7C3AED]"
              : "text-[#8888aa] border-b-transparent"
          }`}
        >
          ✨ 포인트 적립
        </button>
        <button
          onClick={() => setActiveTab("exch")}
          className={`flex-1 py-3 px-1.5 rounded-none text-[12px] font-bold border-none border-b-2 cursor-pointer text-center transition-all bg-transparent ${
            activeTab === "exch"
              ? "text-[#7C3AED] border-b-[#7C3AED]"
              : "text-[#8888aa] border-b-transparent"
          }`}
        >
          🎁 혜택 교환
        </button>
      </div>

      {/* Content */}
      <div className="p-4 pb-6">
        {activeTab === "earn" ? (
          <>
            <div className="mb-3">
              <div className="text-[15px] font-black text-[#1a1a2e]">
                포인트 적립 방법
              </div>
              <div className="text-[12px] text-[#8888aa] mt-[2px]">
                활동에 참여하고 포인트를 적립하세요
              </div>
            </div>

            <div className="bg-white/95 rounded-[20px] p-1 px-4 mb-3.5 shadow-[0_2px_12px_rgba(60,60,120,0.08)]">
              {earnItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 py-3.5 border-b border-[rgba(0,0,0,0.05)] last:border-b-0"
                >
                  <div className="text-[20px] w-[42px] h-[42px] bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-[rgba(60,187,162,0.08)] rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-[#1a1a2e]">
                      {item.title}
                    </div>
                    <div className="text-[12px] text-[#8888aa] mt-[2px]">
                      {item.desc}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[2px]">
                    <div className="text-sm font-black text-[#3CBBA2]">
                      {item.points}
                    </div>
                    <div className="text-[10px] text-[#8888aa]">{item.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {isLoadingBenefits ? (
              <div className="mt-6 text-center text-[13px] font-bold text-[#7C3AED]">
                혜택 목록을 불러오는 중이에요…
              </div>
            ) : benefits.length === 0 ? (
              <div className="mt-6 text-center text-[13px] font-bold text-[#8888aa]">
                현재 교환 가능한 혜택이 없어요
              </div>
            ) : (
              <>
                {popularBenefits.length > 0 && (
                  <>
                    <div className="text-[13px] font-black text-[#8888aa] tracking-[0.5px] mt-4 mb-2">
                      인기 혜택
                    </div>

                    {popularBenefits.map((item) => {
                      const icon = getBenefitIcon(item.code);
                      const isRedeeming = redeemingCode === item.code;

                      return (
                        <div
                          key={item.code}
                          className="bg-white/95 rounded-[16px] p-4 mb-2.5 shadow-[0_2px_12px_rgba(60,60,120,0.08)] cursor-pointer transition-all hover:border-[rgba(124,58,237,0.2)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(60,60,120,0.12)] border border-transparent"
                          onClick={() => !isRedeeming && handleExchange(item)}
                        >
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="text-[28px] w-12 h-12 bg-gradient-to-br from-[#f5eeff] to-[#eef9f5] rounded-[14px] flex items-center justify-center flex-shrink-0">
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div className="text-[15px] font-black text-[#1a1a2e]">
                                {item.benefitName}
                              </div>
                              <div className="text-[12px] text-[#8888aa] leading-[1.4] mt-[2px]">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2.5 border-t border-[rgba(0,0,0,0.05)]">
                            <div>
                              <div className="text-[13px] font-black text-[#7C3AED]">
                                {item.pointsRequired.toLocaleString()}P
                              </div>
                              <div className="text-[11px] text-[#8888aa]">
                                필요 포인트
                              </div>
                            </div>
                            <button
                              className="bg-gradient-to-br from-[#7C3AED] to-[#5b21b6] text-white border-none rounded-[10px] py-2 px-[18px] text-[13px] font-black cursor-pointer disabled:opacity-50"
                              disabled={isRedeeming}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExchange(item);
                              }}
                            >
                              {isRedeeming ? "처리중…" : "교환하기"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {otherBenefits.length > 0 && (
                  <>
                    <div className="text-[13px] font-black text-[#8888aa] tracking-[0.5px] mt-4 mb-2">
                      생활 혜택
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {otherBenefits.map((item) => {
                        const icon = getBenefitIcon(item.code);
                        const isRedeeming = redeemingCode === item.code;

                        return (
                          <div
                            key={item.code}
                            className="bg-white/95 rounded-[16px] p-4 shadow-[0_2px_12px_rgba(60,60,120,0.08)] cursor-pointer transition-all hover:border-[rgba(124,58,237,0.2)] hover:-translate-y-[1px] border border-transparent"
                            onClick={() => !isRedeeming && handleExchange(item)}
                          >
                            <div className="text-[28px] mb-2">{icon}</div>
                            <div className="text-[13px] font-black text-[#1a1a2e]">
                              {item.benefitName}
                            </div>
                            <div className="text-[11px] text-[#8888aa] my-1 mb-2">
                              {item.description}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.05)]">
                              <div className="text-[12px] font-black text-[#7C3AED]">
                                {item.pointsRequired.toLocaleString()}P
                              </div>
                              <button
                                className="bg-gradient-to-br from-[#7C3AED] to-[#5b21b6] text-white border-none rounded-[10px] py-1.5 px-3 text-[12px] font-black cursor-pointer disabled:opacity-50"
                                disabled={isRedeeming}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExchange(item);
                                }}
                              >
                                {isRedeeming ? "…" : "교환"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            <div className="bg-[rgba(124,58,237,0.05)] rounded-xl py-3 px-3.5 text-[12px] text-[#8888aa] leading-[1.7] mt-3.5 border border-[rgba(124,58,237,0.08)]">
              💡 교환 신청 시 가입 이메일로 쿠폰이 자동 발송됩니다. 발송까지
              최대 24시간이 소요될 수 있어요.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

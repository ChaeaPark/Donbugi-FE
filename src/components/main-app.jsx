"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/app-context";
import { getStoredUserId, pointApi } from "@/lib/api";
import { NavBar } from "@/components/shared/nav-bar";
import { Toast } from "@/components/shared/toast";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { MarketTempPopup } from "@/components/shared/market-temp-popup";
import { AlertPopup } from "@/components/shared/alert-popup";

import { AuthScreen } from "@/components/auth/auth-screen";
import { NicknameScreen } from "@/components/auth/nickname-screen";
import { OnboardingScreen } from "@/components/auth/onboarding-screen";
import { ResultScreen } from "@/components/auth/result-screen";

import { HomeScreen } from "@/components/home/home-screen";
import { NewsScreen } from "@/components/news/news-screen";
import { CalendarScreen } from "@/components/calendar/calendar-screen";
import { ShopScreen } from "@/components/shop/shop-screen";
import { MyScreen } from "@/components/my/my-screen";

export function MainApp() {
  const { isReady, currentScreen, currentTab, toast } = useApp();
  const attendanceRequestedRef = useRef(false);

  useEffect(() => {
    const requestAttendance = async () => {
      if (!isReady || currentScreen !== "main") {
        return;
      }

      if (attendanceRequestedRef.current) {
        return;
      }

      const userId = getStoredUserId();

      if (!userId) {
        console.log("출석 체크 불가: userId 없음");
        return;
      }

      try {
        attendanceRequestedRef.current = true;

        console.log("출석 체크 요청 시작:", userId);

        const attendanceResult = await pointApi.checkAttendance({
          userId,
        });

        console.log("출석 체크 응답:", attendanceResult);

        const points =
          attendanceResult?.pointsAwardedThisRequest ??
          attendanceResult?.pointsAwarded ??
          attendanceResult?.awardedPoints ??
          attendanceResult?.rewardPoints ??
          attendanceResult?.delta ??
          0;

        if (points > 0) {
          toast?.(`🔥 출석 체크 완료! +${points}P 적립`);
        }
      } catch (error) {
        attendanceRequestedRef.current = false;
        console.error("출석 체크 실패:", error);
      }
    };

    requestAttendance();
  }, [isReady, currentScreen, toast]);

  const renderMainTab = () => {
    switch (currentTab) {
      case "home":
        return <HomeScreen />;
      case "news":
        return <NewsScreen />;
      case "calendar":
        return <CalendarScreen />;
      case "shop":
        return <ShopScreen />;
      case "my":
        return <MyScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "auth":
        return <AuthScreen />;
      case "nickname":
        return <NicknameScreen />;
      case "onboarding":
        return <OnboardingScreen />;
      case "result":
        return <ResultScreen />;
      case "main":
        return renderMainTab();
      default:
        return <AuthScreen />;
    }
  };

  if (!isReady) {
    return (
      <div className="w-[390px] h-[844px] bg-gradient-to-br from-[#f5eeff] to-[#eef9f5] rounded-[44px] shadow-[0_20px_80px_rgba(124,58,237,0.18),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col my-6 mx-auto relative">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-3 text-[42px]">🐢</div>
            <p className="text-[15px] font-bold text-[#7C3AED]">
              돈부기 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showNav = currentScreen === "main";

  return (
    <div className="w-[390px] h-[844px] bg-gradient-to-br from-[#f5eeff] to-[#eef9f5] rounded-[44px] shadow-[0_20px_80px_rgba(124,58,237,0.18),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col my-6 mx-auto relative">
      <div className="flex flex-col flex-1 min-h-0">{renderScreen()}</div>

      {showNav && <NavBar />}

      <NotificationPanel />
      <MarketTempPopup />
      <AlertPopup />
      <Toast />
    </div>
  );
}
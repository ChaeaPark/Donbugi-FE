"use client";

import { useEffect, useState } from "react";
import { useApp, KOSPI_STATUS, CHARS } from "@/lib/app-context";
import { authApi, mainApi } from "@/lib/api";

const NICKNAME_KEY = "donbugi_nickname";
const USER_CHAR_KEY = "donbugi_user_char";

export function ProfileArea() {
  const {
     userNick,
  setUserNick,
  userChar,
  setUserChar,
  setNotifOpen,
  notifBadge,
  setMarketTempOpen,
  currentKospiStatus,
  economicWeather,
  setEconomicWeather,
  } = useApp();

  const [displayNick, setDisplayNick] = useState(userNick || "닉네임");
  const [displayChar, setDisplayChar] = useState(userChar || CHARS[0]);
  const kospi = KOSPI_STATUS[currentKospiStatus];

  useEffect(() => {
    const loadSavedUserInfo = async () => {
      if (typeof window !== "undefined") {
        const savedNickname = localStorage.getItem(NICKNAME_KEY);
        const savedCharacter = localStorage.getItem(USER_CHAR_KEY);

        if (savedNickname) {
          setDisplayNick(savedNickname);
          setUserNick(savedNickname);
        }

        if (savedCharacter) {
          try {
            const parsedCharacter = JSON.parse(savedCharacter);

            setDisplayChar(parsedCharacter);
            setUserChar(parsedCharacter);
          } catch (error) {
            console.error("캐릭터 정보 파싱 실패:", error);
          }
        }
      }

      try {
        const profile = await authApi.getMe();

        if (profile?.nickname) {
          setDisplayNick(profile.nickname);
          setUserNick(profile.nickname);

          if (typeof window !== "undefined") {
            localStorage.setItem(NICKNAME_KEY, profile.nickname);
          }
        }

        if (profile?.characterName || profile?.characterEmoji) {
          const level = profile.characterLevel || profile.finIqLevel || 1;

          const serverCharacter = {
            lv: level,
            emoji: profile.characterEmoji || displayChar.emoji || "🐥",
            name: profile.characterName || displayChar.name || "병아리",
            tag: displayChar.tag || `Lv.${level}`,
            desc:
              displayChar.desc ||
              "돈부기와 함께 금융 지능을 키워가는 중이에요.",
            features: displayChar.features || [],
            lvLabel: `Lv.${level}`,
          };

          setDisplayChar(serverCharacter);
          setUserChar(serverCharacter);

          if (typeof window !== "undefined") {
            localStorage.setItem(
              USER_CHAR_KEY,
              JSON.stringify(serverCharacter)
            );
          }
        }
      } catch (error) {
        console.error("프로필 조회 실패:", error);
      }
    };

    loadSavedUserInfo();
  }, [setUserNick, setUserChar]);

  useEffect(() => {
    if (userNick && userNick !== "닉네임") {
      setDisplayNick(userNick);
    }
  }, [userNick]);

  useEffect(() => {
    if (userChar) {
      setDisplayChar(userChar);
    }
  }, [userChar]);


  useEffect(() => {
  const loadEconomicWeather = async () => {
    try {
      const data = await mainApi.getEconomicWeather();
      setEconomicWeather(data);

      console.log("경제 날씨 API:", data);

    } catch (error) {
      console.error("경제 날씨 조회 실패:", error);
    }
  };

  loadEconomicWeather();
}, []);


  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-5 py-5 text-white shadow-[0_16px_35px_rgba(124,58,237,0.25)]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-[66px] w-[66px] items-center justify-center rounded-3xl bg-white/20 text-[34px] backdrop-blur">
            <span>{displayChar.emoji || "🐥"}</span>
            <span className="absolute -bottom-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-[#7C3AED] shadow">
              {displayChar.lvLabel || `Lv.${displayChar.lv || 1}`}
            </span>
          </div>

          <div>
            <p className="text-[14px] font-semibold text-white/80">
              안녕하세요!
            </p>
            <h2 className="mt-1 text-[24px] font-extrabold">
              {displayNick}님
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMarketTempOpen(true)}
            className="rounded-2xl bg-white/18 px-3 py-2 text-left shadow-sm backdrop-blur"
          >
            <div className="text-[18px] leading-none">
                {economicWeather?.emoji || kospi.icon}
            </div>

            <div className="mt-1 text-[10px] font-semibold text-white/75">
              시장 날씨
            </div>

            <div className="text-[12px] font-extrabold">
              {economicWeather?.weatherLabel || kospi.label}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 text-[22px] shadow-sm backdrop-blur"
          >
            🔔
            {notifBadge > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF4D6D] px-1 text-[11px] font-extrabold text-white">
                {notifBadge}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 rounded-2xl bg-white/16 px-4 py-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-bold text-white/85">
            금융 지능 지수 (FinIQ)
          </span>
          <span className="text-[15px] font-extrabold">3,240P</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-[76%] rounded-full bg-white" />
        </div>

        <p className="mt-2 text-[12px] font-semibold text-white/75">
          다음 레벨까지 760P
        </p>
      </div>
    </section>
  );
}
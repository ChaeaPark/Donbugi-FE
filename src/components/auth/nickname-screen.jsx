"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useApp } from "@/lib/app-context";

const NICKNAME_KEY = "donbugi_nickname";

export function NicknameScreen() {
  const { goToScreen, setUserNick, toast, setObStep, setObScores } = useApp();

  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const trimmedNickname = nickname.trim();
  const isValid = trimmedNickname.length >= 2 && trimmedNickname.length <= 10;

  const saveNicknameToBrowser = (value) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(NICKNAME_KEY, value);
  };

  const handleNext = async () => {
    if (!isValid) {
      toast("⚠️ 닉네임은 2~10자로 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      await authApi.updateMe({
        nickname: trimmedNickname,
      });

      setUserNick(trimmedNickname);
      saveNicknameToBrowser(trimmedNickname);

      setObStep(0);
      setObScores([0, 0, 0, 0]);

      toast("✅ 닉네임이 저장되었습니다.");
      goToScreen("onboarding");
    } catch (error) {
      toast(error.message || "⚠️ 닉네임 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF] flex flex-col items-center justify-center px-6 py-10">
      <section className="w-full max-w-[420px] text-center mb-8">
        <div className="text-[50px] mb-4">👋</div>
        <h1 className="text-[30px] font-extrabold text-[#1a1a2e] mb-3">
          반가워요!
        </h1>
        <p className="text-[16px] leading-7 text-[#6b6680]">
          돈부기에서 사용할
          <br />
          닉네임을 입력해주세요
        </p>
      </section>

      <section className="w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_16px_45px_rgba(124,58,237,0.12)] px-6 py-7">
        <label className="block">
          <span className="block text-[14px] font-bold text-[#1a1a2e] mb-2">
            닉네임
          </span>
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="2~10자 사이로 입력하세요"
            maxLength={10}
            className="w-full border-2 border-[#e8e0ff] rounded-[14px] py-3.5 px-4 text-[15px] text-[#1a1a2e] outline-none transition-colors focus:border-[#7C3AED] bg-white"
          />
        </label>

        <p className="mt-3 text-[13px] text-[#9A94B3]">
          ⚠️ 한글, 영문, 숫자 사용 가능 (최대 10자)
        </p>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid || isLoading}
          className="w-full mt-7 bg-[#7C3AED] text-white rounded-[16px] py-4 text-[16px] font-extrabold shadow-[0_10px_24px_rgba(124,58,237,0.28)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "저장 중..." : "다음으로 →"}
        </button>
      </section>
    </div>
  );
}
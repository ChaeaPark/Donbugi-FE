"use client";

import { useState } from "react";
import { authApi, saveAuth, pointApi } from "@/lib/api";
import { useApp } from "@/lib/app-context";

const NICKNAME_KEY = "donbugi_nickname";

export function AuthScreen() {
  const { goToScreen, toast, setUserNick, setUserChar, setCurrentTab } =
    useApp();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const saveNicknameToBrowser = (value) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(NICKNAME_KEY, value);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast("⚠️ 이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      const loginResult = await authApi.login({
        email: email.trim(),
        password,
      });

      saveAuth({
        accessToken: loginResult.accessToken,
        userId: loginResult.userId,
      });

      try {
        const profile = await authApi.getMe();

        if (profile.nickname) {
          setUserNick(profile.nickname);
          saveNicknameToBrowser(profile.nickname);
        }

        if (profile.characterName || profile.characterEmoji) {
          const level = profile.characterLevel || profile.finIqLevel || 1;

          setUserChar({
            lv: level,
            emoji: profile.characterEmoji || "🐢",
            name: profile.characterName || "거북이",
            tag: `Lv.${level}`,
            desc: "돈부기와 함께 금융 지능을 키워가는 중이에요.",
            features: [
              `보유 포인트 ${profile.finIqBalance || 0}P`,
              `다음 레벨까지 ${profile.pointsToNextLevel || 0}P`,
              `성장률 ${profile.finIqProgressPercent || 0}%`,
            ],
            lvLabel: `Lv.${level}`,
          });
        }
      } catch (profileError) {
        console.error("프로필 조회 실패:", profileError);
      }

      // 로그인 성공 후 출석 체크 (실패해도 로그인 흐름에 영향 없음)
      try {
        const attendanceResult = await pointApi.checkAttendance({
          userId: loginResult.userId,
        });

        if (!attendanceResult.alreadyCheckedInForDate) {
          const points = attendanceResult.pointsAwardedThisRequest;
          if (points > 0) {
            toast(`🔥 출석 체크 완료! +${points}P 적립`);
          }
        }
      } catch (attendanceError) {
        console.error("출석 체크 실패:", attendanceError);
      }

      setCurrentTab("home");
      goToScreen("main");
    } catch (error) {
      toast(error.message || "⚠️ 로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email.trim()) {
      toast("⚠️ 이메일을 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      toast("⚠️ 비밀번호는 8자 이상이어야 해요.");
      return;
    }

    if (password !== confirmPassword) {
      toast("⚠️ 비밀번호가 일치하지 않아요.");
      return;
    }

    try {
      setIsLoading(true);

      const signupResult = await authApi.signup({
        email: email.trim(),
        password,
      });

      saveAuth({
        accessToken: signupResult.accessToken,
        userId: signupResult.userId,
      });

      toast("✅ 회원가입이 완료되었습니다.");
      goToScreen("nickname");
    } catch (error) {
      toast(error.message || "⚠️ 회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }

    if (isLoginMode) {
      handleLogin();
      return;
    }

    handleSignup();
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF] flex flex-col items-center justify-center px-6 py-10">
      <section className="w-full max-w-[420px] text-center mb-8">
        <div className="text-[54px] mb-3">🐢</div>
        <h1 className="text-[34px] font-extrabold text-[#1a1a2e] mb-2">
          돈부기
        </h1>
        <p className="text-[17px] font-semibold text-[#7C3AED] mb-1">
          뉴스로 키우는 나의 금융 지능
        </p>
        <p className="text-[14px] text-[#6b6680]">
          매일 조금씩, 확실하게 성장하세요
        </p>
      </section>

      <section className="w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_16px_45px_rgba(124,58,237,0.12)] px-6 py-7">
        <div className="flex bg-[#F1EAFF] rounded-[18px] p-1 mb-7">
          <button
            type="button"
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-3 rounded-[14px] text-[15px] font-bold transition-all ${
              isLoginMode
                ? "bg-[#7C3AED] text-white shadow-md"
                : "text-[#7C3AED]"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-3 rounded-[14px] text-[15px] font-bold transition-all ${
              !isLoginMode
                ? "bg-[#7C3AED] text-white shadow-md"
                : "text-[#7C3AED]"
            }`}
          >
            회원가입
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="block text-[14px] font-bold text-[#1a1a2e] mb-2">
              이메일
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일 주소를 입력하세요"
              className="w-full border-2 border-[#e8e0ff] rounded-[14px] py-3.5 px-4 text-[15px] text-[#1a1a2e] outline-none transition-colors focus:border-[#7C3AED] bg-white"
            />
          </label>

          <label className="block">
            <span className="block text-[14px] font-bold text-[#1a1a2e] mb-2">
              비밀번호
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                isLoginMode ? "비밀번호를 입력하세요" : "8자 이상 입력하세요"
              }
              className="w-full border-2 border-[#e8e0ff] rounded-[14px] py-3.5 px-4 text-[15px] text-[#1a1a2e] outline-none transition-colors focus:border-[#7C3AED] bg-white"
            />
          </label>

          {!isLoginMode && (
            <label className="block">
              <span className="block text-[14px] font-bold text-[#1a1a2e] mb-2">
                비밀번호 확인
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full border-2 border-[#e8e0ff] rounded-[14px] py-3.5 px-4 text-[15px] text-[#1a1a2e] outline-none transition-colors focus:border-[#7C3AED] bg-white"
              />
            </label>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#7C3AED] text-white rounded-[16px] py-4 text-[16px] font-extrabold shadow-[0_10px_24px_rgba(124,58,237,0.28)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "처리 중..." : isLoginMode ? "로그인" : "회원가입"}
          </button>
        </div>

        <div className="mt-6 text-center text-[14px] text-[#6b6680]">
          {isLoginMode ? (
            <>
              계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className="font-bold text-[#7C3AED]"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className="font-bold text-[#7C3AED]"
              >
                로그인
              </button>
            </>
          )}
        </div>

        {!isLoginMode && (
          <p className="mt-4 text-center text-[12px] text-[#9A94B3]">
            서비스 이용약관 및 개인정보 처리방침에 동의합니다.
          </p>
        )}
      </section>
    </div>
  );
}
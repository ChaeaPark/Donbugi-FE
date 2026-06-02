"use client";

import { useEffect, useState } from "react";
import { useApp, CHARS } from "@/lib/app-context";
import { getStoredUserId, pointApi, quizApi, newsInterestApi } from "@/lib/api";

function getRateText(stats) {
  if (!stats || typeof stats.ratePercent !== "number") return "0%";
  return `${stats.ratePercent}%`;
}

function getStatsDetailText(stats) {
  if (!stats) return "정답 0 · 오답 0 · 총 0";
  return `정답 ${stats.correct ?? 0} · 오답 ${stats.wrong ?? 0} · 총 ${stats.total ?? 0}`;
}

function formatDateTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return value; }
}

function formatPointDelta(delta) {
  if (typeof delta !== "number") return "0P";
  return delta > 0 ? `+${delta}P` : `${delta}P`;
}

function getPointIcon(type) {
  if (!type) return "💰";
  const t = String(type).toUpperCase();
  if (t.includes("ATTENDANCE")) return "🔥";
  if (t.includes("QUIZ")) return "⚔️";
  if (t.includes("REDEEM") || t.includes("SPEND") || t.includes("USE")) return "🎁";
  return "💰";
}

export function MyScreen() {
  const { userNick, userChar, toast } = useApp();
  const char = userChar || CHARS[0];

  const [dashboard, setDashboard] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [pointBalance, setPointBalance] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [pointError, setPointError] = useState("");
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(false);

  // trends
  const [trends, setTrends] = useState(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  const fetchQuizDashboard = async () => {
    const userId = getStoredUserId();
    if (!userId) {
      setDashboard(null);
      setDashboardError("로그인 후 퀴즈 통계를 확인할 수 있어요.");
      setIsLoadingDashboard(false);
      return;
    }
    try {
      setIsLoadingDashboard(true);
      setDashboardError("");
      const data = await quizApi.getDashboard({ userId });
      setDashboard(data);
    } catch (error) {
      console.error("퀴즈 대시보드 조회 실패:", error);
      setDashboardError(error.message || "퀴즈 통계를 불러오지 못했어요.");
      toast?.("⚠️ 퀴즈 통계를 불러오지 못했어요.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchPointData = async () => {
    const userId = getStoredUserId();
    if (!userId) {
      setPointBalance(0); setMonthlySummary(null);
      setRecentActivity([]); setAttendanceStatus(null);
      setPointError("로그인 후 포인트 정보를 확인할 수 있어요.");
      setIsLoadingPoints(false);
      return;
    }
    try {
      setIsLoadingPoints(true);
      setPointError("");
      const [balanceData, monthlyData, recentData, attendanceData] = await Promise.all([
        pointApi.getBalance(userId),
        pointApi.getMonthlySummary({ userId }),
        pointApi.getRecentActivity(userId),
        pointApi.getAttendanceStatus(userId),
      ]);
      setPointBalance(balanceData?.balance ?? 0);
      setMonthlySummary(monthlyData ?? null);
      setRecentActivity(Array.isArray(recentData) ? recentData : []);
      setAttendanceStatus(attendanceData ?? null);
    } catch (error) {
      console.error("포인트 정보 조회 실패:", error);
      setPointError(error.message || "포인트 정보를 불러오지 못했어요.");
      toast?.("⚠️ 포인트 정보를 불러오지 못했어요.");
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const fetchTrends = async () => {
    const userId = getStoredUserId();
    if (!userId) { setIsLoadingTrends(false); return; }
    try {
      setIsLoadingTrends(true);
      const data = await newsInterestApi.getTrends({ userId, top: 5 });
      setTrends(data);
    } catch (err) {
      console.error("뉴스 트렌드 조회 실패:", err);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleAttendanceCheck = async () => {
    const userId = getStoredUserId();
    if (!userId) { toast?.("로그인 후 출석 체크를 할 수 있어요."); return; }
    try {
      setIsCheckingAttendance(true);
      await pointApi.checkAttendance({ userId, date: new Date().toISOString().slice(0, 10) });
      await fetchPointData();
      toast?.("🔥 출석 체크가 완료되었어요!");
    } catch (error) {
      console.error("출석 체크 실패:", error);
      toast?.(error.message || "출석 체크에 실패했어요.");
    } finally {
      setIsCheckingAttendance(false);
    }
  };

  useEffect(() => {
    fetchQuizDashboard();
    fetchPointData();
    fetchTrends();
  }, []);

  const rollingWeek = dashboard?.rollingWeek;
  const thisMonth = dashboard?.thisMonth;
  const wrongNotes = dashboard?.wrongNotesInWindow || [];

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#F7F3FF] pb-8">
      {/* Avatar Hero */}
      <section className="mx-4 mt-4 rounded-[28px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-5 py-6 text-white shadow-[0_16px_35px_rgba(124,58,237,0.25)]">
        <div className="flex items-center gap-4">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-white/20 text-[42px]">
            {char.emoji}
          </div>
          <div>
            <div className="text-[13px] font-bold text-white/75">나의 금융 캐릭터</div>
            <h1 className="mt-1 text-[24px] font-black">{userNick}</h1>
            <p className="mt-1 text-[13px] font-bold text-white/85">{char.lvLabel} · {char.tag}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/16 p-4">
            <div className="text-[24px] font-black">{isLoadingPoints ? "..." : pointBalance.toLocaleString()}</div>
            <div className="text-[12px] font-bold text-white/75">포인트</div>
          </div>
          <div className="rounded-2xl bg-white/16 p-4">
            <div className="text-[24px] font-black">{isLoadingPoints ? "..." : `${attendanceStatus?.currentStreakDays ?? 0}일`}</div>
            <div className="text-[12px] font-bold text-white/75">연속 출석</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAttendanceCheck}
          disabled={isCheckingAttendance || attendanceStatus?.checkedInToday === true}
          className={`mt-4 w-full rounded-2xl px-4 py-3 text-[14px] font-black transition ${
            attendanceStatus?.checkedInToday
              ? "bg-white/20 text-white/70"
              : "bg-white text-[#7C3AED] active:scale-[0.98]"
          }`}
        >
          {isCheckingAttendance ? "출석 체크 중..." : attendanceStatus?.checkedInToday ? "오늘 출석 완료" : "오늘 출석 체크하기"}
        </button>
      </section>

      {/* Evolution Card */}
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <h2 className="text-[17px] font-black text-[#1a1a2e]">아바타 진화 단계</h2>
        <p className="mt-1 text-[13px] font-bold text-[#8888aa]">현재 {char.lvLabel} · 현재 보유 {pointBalance.toLocaleString()}P</p>
        <div className="mt-4 flex items-center justify-between">
          {CHARS.map((item) => {
            const isCurrent = item.lv === char.lv;
            return (
              <div key={item.lv} className="text-center">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-[24px] ${isCurrent ? "bg-[#7C3AED] shadow-lg" : "bg-[#F1EAFF]"}`}>
                  {item.emoji}
                </div>
                <div className={`mt-1 text-[10px] font-black ${isCurrent ? "text-[#7C3AED]" : "text-[#aaa]"}`}>
                  {isCurrent ? `${item.lvLabel} ◀` : item.lvLabel}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Point Summary */}
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[#1a1a2e]">포인트 요약</h2>
          <button type="button" onClick={fetchPointData} className="text-[12px] font-black text-[#7C3AED]">새로고침</button>
        </div>
        {isLoadingPoints && <div className="mt-4 rounded-xl bg-[#F7F3FF] p-4 text-center text-[13px] font-bold text-[#7C3AED]">포인트 정보를 불러오는 중이에요</div>}
        {!isLoadingPoints && pointError && <div className="mt-4 rounded-xl bg-[#FFF5F7] p-4 text-center text-[13px] font-bold text-[#c0243a]">{pointError}</div>}
        {!isLoadingPoints && !pointError && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-[#F7F3FF] p-3 text-center">
                <div className="text-[11px] font-black text-[#8888aa]">이번 달 적립</div>
                <div className="mt-2 text-[18px] font-black text-[#7C3AED]">{(monthlySummary?.earnedPoints ?? 0).toLocaleString()}P</div>
              </div>
              <div className="rounded-2xl bg-[#FFF5F7] p-3 text-center">
                <div className="text-[11px] font-black text-[#8888aa]">이번 달 사용</div>
                <div className="mt-2 text-[18px] font-black text-[#FF4D6D]">{(monthlySummary?.spentPoints ?? 0).toLocaleString()}P</div>
              </div>
              <div className="rounded-2xl bg-[#F0FAF7] p-3 text-center">
                <div className="text-[11px] font-black text-[#8888aa]">순 포인트</div>
                <div className="mt-2 text-[18px] font-black text-[#3CBBA2]">{(monthlySummary?.netPoints ?? 0).toLocaleString()}P</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-[#faf8ff] p-3 text-[12px] font-bold text-[#7A728C]">이번 달 포인트 요약이에요.</div>
          </>
        )}
      </section>

      {/* News Trends — API 연동 */}
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[#1a1a2e]">최근 관심 뉴스 동향</h2>
          <button type="button" onClick={fetchTrends} className="text-[12px] font-black text-[#7C3AED]">새로고침</button>
        </div>
        <p className="mt-1 text-[13px] font-bold text-[#8888aa]">
          {trends?.month ? `${trends.month} 기준` : "최근 한 달"} 가장 많이 읽은 주제
        </p>

        {isLoadingTrends && (
          <div className="mt-4 rounded-xl bg-[#F7F3FF] p-4 text-center text-[13px] font-bold text-[#7C3AED]">
            트렌드를 불러오는 중이에요
          </div>
        )}

        {!isLoadingTrends && (!trends?.topics || trends.topics.length === 0) && (
          <div className="mt-4 rounded-xl bg-[#faf8ff] p-4 text-center text-[13px] font-bold text-[#8888aa]">
            아직 읽은 뉴스가 없어요
          </div>
        )}

        {!isLoadingTrends && trends?.topics && trends.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {trends.topics.map((topic) => (
              <span
                key={topic.name}
                className="rounded-full bg-[#F1EAFF] px-3 py-1.5 text-[12px] font-black text-[#7C3AED]"
              >
                #{topic.name} · {topic.count}회
              </span>
            ))}
          </div>
        )}

        {!isLoadingTrends && trends?.aiInsight && (
          <div className="mt-4 rounded-2xl bg-[#F7F3FF] p-4 text-[13px] font-bold leading-relaxed text-[#6b6680]">
            🤖 AI 한마디: {trends.aiInsight}
          </div>
        )}
      </section>

      {/* Quiz Stats */}
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[#1a1a2e]">퀴즈 통계</h2>
          <button type="button" onClick={fetchQuizDashboard} className="text-[12px] font-black text-[#7C3AED]">새로고침</button>
        </div>
        {isLoadingDashboard && <div className="mt-4 rounded-xl bg-[#F7F3FF] p-4 text-center text-[13px] font-bold text-[#7C3AED]">퀴즈 통계를 불러오는 중이에요</div>}
        {!isLoadingDashboard && dashboardError && <div className="mt-4 rounded-xl bg-[#FFF5F7] p-4 text-center text-[13px] font-bold text-[#c0243a]">{dashboardError}</div>}
        {!isLoadingDashboard && !dashboardError && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F7F3FF] p-4">
                <div className="text-[12px] font-black text-[#8888aa]">최근 7일 정답률</div>
                <div className="mt-2 text-[28px] font-black text-[#7C3AED]">{getRateText(rollingWeek)}</div>
                <div className="mt-1 text-[11px] font-bold text-[#8888aa] leading-relaxed">{getStatsDetailText(rollingWeek)}</div>
              </div>
              <div className="rounded-2xl bg-[#F0FAF7] p-4">
                <div className="text-[12px] font-black text-[#8888aa]">이번 달 정답률</div>
                <div className="mt-2 text-[28px] font-black text-[#3CBBA2]">{getRateText(thisMonth)}</div>
                <div className="mt-1 text-[11px] font-bold text-[#8888aa] leading-relaxed">{getStatsDetailText(thisMonth)}</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-[#faf8ff] p-3 text-[12px] font-bold text-[#7A728C]">
              집계 기간: {dashboard?.rollingWindowStart || "-"} ~ {dashboard?.rollingWindowEnd || "-"}
            </div>
          </>
        )}
      </section>

      {/* Wrong Notes */}
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <h2 className="text-[17px] font-black text-[#1a1a2e]">과제 오답노트</h2>
        <p className="mt-1 text-[13px] font-bold text-[#8888aa]">최근 7일 이내 틀린 문제</p>
        {isLoadingDashboard && <div className="mt-4 rounded-xl bg-[#F7F3FF] p-4 text-center text-[13px] font-bold text-[#7C3AED]">오답노트를 불러오는 중이에요</div>}
        {!isLoadingDashboard && !dashboardError && wrongNotes.length === 0 && (
          <div className="mt-4 rounded-xl bg-[#F0FAF7] p-4 text-center">
            <div className="text-[28px]">🎉</div>
            <p className="mt-2 text-[13px] font-black text-[#1a7a64]">최근 오답이 없어요!</p>
          </div>
        )}
        {!isLoadingDashboard && !dashboardError && wrongNotes.map((note) => (
          <div key={note.id} className="mt-3 rounded-2xl border-2 border-[#F1EAFF] p-4">
            <div className="text-[14px] font-black leading-relaxed text-[#1a1a2e]">Q. {note.question}</div>
            <div className="mt-2 text-[12px] font-bold text-[#c0243a]">내 답: {note.userAnswer}</div>
            <div className="mt-1 text-[12px] font-bold text-[#1a7a64]">정답: {note.correctAnswer}</div>
            <div className="mt-2 rounded-xl bg-[#F7F3FF] p-3 text-[12px] font-bold leading-relaxed text-[#6b6680]">💡 {note.explanation}</div>
            <div className="mt-2 text-[11px] font-bold text-[#aaa]">{formatDateTime(note.answeredAt)}</div>
          </div>
        ))}
      </section>

      {/* Point History */}
      <section className="mx-4 mt-4 rounded-[22px] bg-white p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <h2 className="text-[17px] font-black text-[#1a1a2e]">내역</h2>
        <p className="mt-1 text-[13px] font-bold text-[#8888aa]">포인트 적립 및 사용 내역</p>
        {isLoadingPoints && <div className="mt-4 rounded-xl bg-[#F7F3FF] p-4 text-center text-[13px] font-bold text-[#7C3AED]">포인트 내역을 불러오는 중이에요</div>}
        {!isLoadingPoints && pointError && <div className="mt-4 rounded-xl bg-[#FFF5F7] p-4 text-center text-[13px] font-bold text-[#c0243a]">{pointError}</div>}
        {!isLoadingPoints && !pointError && recentActivity.length === 0 && (
          <div className="mt-4 rounded-xl bg-[#faf8ff] p-4 text-center text-[13px] font-bold text-[#8888aa]">아직 포인트 내역이 없어요.</div>
        )}
        {!isLoadingPoints && !pointError && recentActivity.length > 0 && (
          <div className="mt-3 space-y-3">
            {recentActivity.slice(0, 3).map((item, index) => {
              const isPlus = (item.delta ?? 0) > 0;
              return (
                <div key={`${item.type}-${item.occurredAt}-${index}`} className="flex items-center gap-3 rounded-2xl bg-[#faf8ff] p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[22px]">{getPointIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="text-[13px] font-black text-[#1a1a2e]">{item.title || "포인트 내역"}</div>
                    <div className="mt-1 text-[11px] font-bold text-[#8888aa]">{item.detail || formatDateTime(item.occurredAt)}</div>
                  </div>
                  <div className={`text-[14px] font-black ${isPlus ? "text-[#3CBBA2]" : "text-[#FF4D6D]"}`}>{formatPointDelta(item.delta)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
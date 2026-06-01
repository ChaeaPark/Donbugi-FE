"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import { getStoredUserId, pointApi, quizApi } from "@/lib/api";

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function normalizeTodayQuiz(item, index) {
  const options = Array.isArray(item.options) ? item.options : [];
  const correctIndex =
    typeof item.correctIndex === "number"
      ? item.correctIndex
      : typeof item.correct_index === "number"
        ? item.correct_index
        : 0;

  return {
    id: `${item.articleId ?? "article"}-${item.order ?? index + 1}`,
    order: item.order ?? index + 1,
    articleId: item.articleId,
    articleTitle: item.articleTitle || "오늘의 기사",
    question: item.question || "퀴즈를 불러오지 못했어요.",
    options,
    correctIndex,
    explanation: item.explanation || "해설이 제공되지 않았어요.",
  };
}

export function TodayQuiz() {
  const { qDone, setQDone, toast } = useApp();

  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rewardRequested, setRewardRequested] = useState(false);

  const sessionId = `daily-${getTodayKey()}`;

  const doneCount = useMemo(() => {
    return quizzes.filter((quiz) => qDone[quiz.id]).length;
  }, [quizzes, qDone]);

  const fetchTodayQuiz = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const data = await quizApi.getRandomSession(3);
      const quizList = Array.isArray(data) ? data : [];

      if (!quizList.length) {
        setQuizzes([]);
        setLoadError("오늘의 과제를 불러오지 못했어요.");
        return;
      }

      setQuizzes(quizList.map(normalizeTodayQuiz).slice(0, 3));
    } catch (error) {
      console.error("오늘의 과제 조회 실패:", error);
      setLoadError(error.message || "오늘의 과제를 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayQuiz();
  }, []);

  const saveQuizAttempt = async ({
    quiz,
    selectedIndex,
    isCorrect,
    correctAnswer,
  }) => {
    const userId = getStoredUserId();

    if (!userId) {
      return;
    }

    try {
      await quizApi.saveAttempt({
        userId,
        correct: isCorrect,
        question: quiz.question,
        userAnswer: quiz.options[selectedIndex],
        correctAnswer,
        explanation: quiz.explanation,
      });
    } catch (error) {
      console.error("퀴즈 결과 기록 실패:", error);
    }
  };

  const requestDailyQuizReward = async (nextQDone) => {
    const userId = getStoredUserId();

    if (!userId || rewardRequested) {
      return;
    }

    try {
      setRewardRequested(true);

      const results = quizzes.map((quiz) => ({
        order: quiz.order,
        attempted: !!nextQDone[quiz.id],
        correct: !!nextQDone[quiz.id]?.correct,
      }));

      const rewardResult = await pointApi.rewardDailyQuiz({
        userId,
        sessionId,
        results,
      });

      const pointsAwarded = rewardResult?.pointsAwarded || 0;

      if (pointsAwarded > 0) {
        toast(`🎁 오늘의 과제 보상 +${pointsAwarded}P 적립!`);
      } else {
        toast("⚔️ 오늘 과제 완료!");
      }
    } catch (error) {
      console.error("오늘의 과제 보상 실패:", error);
      toast("⚔️ 오늘 과제 완료!");
    }
  };

  const handleAnswer = async (quiz, selectedIndex) => {
    if (qDone[quiz.id]) {
      return;
    }

    const isCorrect = selectedIndex === quiz.correctIndex;
    const correctAnswer = quiz.options[quiz.correctIndex] || "";

    const nextQDone = {
      ...qDone,
      [quiz.id]: {
        answered: true,
        correct: isCorrect,
        selected: selectedIndex,
        correctIndex: quiz.correctIndex,
      },
    };

    setQDone(nextQDone);

    if (isCorrect) {
      toast("✅ 정답이에요!");
    } else {
      toast("❌ 오답이에요! 정답을 확인해보세요.");
    }

    await saveQuizAttempt({
      quiz,
      selectedIndex,
      isCorrect,
      correctAnswer,
    });

    const nextDoneCount = quizzes.filter((item) => nextQDone[item.id]).length;

    if (nextDoneCount === quizzes.length) {
      setTimeout(() => {
        requestDailyQuizReward(nextQDone);
      }, 700);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <span className="text-[17px] font-black text-[#1a1a2e] tracking-[-0.5px]">
          ⚔️ 오늘의 과제
        </span>

        <span className="text-[13px] text-[#7C3AED] font-bold">
          {doneCount} / {quizzes.length || 3} 완료
        </span>
      </div>

      <div className="mx-4 mb-3.5 bg-white/95 rounded-[24px] p-4 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        {isLoading && (
          <div className="rounded-2xl bg-gradient-to-br from-[#f8f0ff] to-[#f0faff] p-5 text-center">
            <div className="mb-2 text-[28px]">🐢</div>
            <p className="text-sm font-black text-[#1a1a2e]">
              오늘의 과제를 불러오는 중이에요
            </p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-2xl bg-gradient-to-br from-[#fff5f7] to-[#f8f0ff] p-5 text-center">
            <div className="mb-2 text-[28px]">⚠️</div>
            <p className="text-sm font-black text-[#1a1a2e]">{loadError}</p>
            <button
              type="button"
              onClick={fetchTodayQuiz}
              className="mt-3 rounded-lg bg-[#7C3AED] px-4 py-2 text-[12px] font-black text-white"
            >
              다시 불러오기
            </button>
          </div>
        )}

        {!isLoading &&
          !loadError &&
          quizzes.map((quiz) => {
            const result = qDone[quiz.id];
            const isDone = !!result;

            return (
              <div
                key={quiz.id}
                className={`bg-gradient-to-br from-[#f8f0ff] to-[#f0faff] rounded-2xl p-4 mb-3 last:mb-0 border-2 transition-colors ${
                  isDone
                    ? result.correct
                      ? "border-[#3CBBA2] bg-[rgba(60,187,162,0.06)]"
                      : "border-[#FF4D6D] bg-[rgba(255,77,109,0.06)]"
                    : "border-transparent"
                }`}
              >
                <div className="mb-2 text-left text-[12px] font-black text-[#7C3AED] leading-relaxed">
                  {quiz.articleTitle}
                </div>

                <div className="text-left text-[15px] font-black text-[#1a1a2e] mb-3 leading-relaxed">
                  Q{quiz.order}. {quiz.question}
                </div>

                <div className="grid gap-2">
                  {quiz.options.map((option, index) => {
                    let buttonClass =
                      "w-full min-h-[48px] py-2.5 px-3.5 border-2 rounded-xl text-[13px] font-bold bg-white cursor-pointer transition-all text-left leading-relaxed flex items-center";

                    if (isDone) {
                      if (index === result.correctIndex) {
                        buttonClass +=
                          " border-[#3CBBA2] bg-[rgba(60,187,162,0.12)] text-[#1a7a64]";
                      } else if (index === result.selected && !result.correct) {
                        buttonClass +=
                          " border-[#FF4D6D] bg-[rgba(255,77,109,0.10)] text-[#c0243a]";
                      } else {
                        buttonClass +=
                          " border-[#ddd] text-[#1a1a2e] opacity-50";
                      }
                    } else {
                      buttonClass +=
                        " border-[#ddd] text-[#1a1a2e] hover:border-[#7C3AED] hover:text-[#7C3AED]";
                    }

                    return (
                      <button
                        key={`${quiz.id}-${option}-${index}`}
                        type="button"
                        className={buttonClass}
                        onClick={() => handleAnswer(quiz, index)}
                        disabled={isDone}
                      >
                        <span className="block w-full">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {isDone && (
                  <div
                    className={`mt-3 py-2.5 px-3 rounded-xl text-[12px] font-bold leading-relaxed text-left ${
                      result.correct
                        ? "bg-[rgba(60,187,162,0.12)] text-[#1a7a64]"
                        : "bg-[rgba(255,77,109,0.10)] text-[#c0243a]"
                    }`}
                  >
                    {result.correct
                      ? "✅ 정답이에요!"
                      : `❌ 오답이에요! 정답: ${
                          quiz.options[quiz.correctIndex]
                        }`}
                    <div className="mt-1 text-[11px] opacity-80">
                      {quiz.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        <div className="bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-[rgba(60,187,162,0.08)] rounded-xl p-3 flex items-center gap-3 mt-3">
          <span className="text-[24px]">📅</span>

          <div className="flex-1">
            <div className="text-[11px] text-[#8888aa] font-bold tracking-wider">
              D-DAY 주요 일정
            </div>
            <div className="text-sm font-black text-[#1a1a2e]">
              미국 소비자물가지수(CPI) 발표
            </div>
            <div className="text-[13px] text-[#7C3AED] font-bold">
              오늘 오후 9:30
            </div>
          </div>

          <button
            type="button"
            className="bg-[#7C3AED] text-white border-none rounded-lg py-2 px-3 text-[12px] font-bold cursor-pointer"
            onClick={() => toast("⏰ 알림이 설정되었어요!")}
          >
            알림 ON
          </button>
        </div>
      </div>
    </>
  );
}
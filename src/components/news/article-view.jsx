"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp, ARTS } from "@/lib/app-context";
import { HashTag } from "@/components/shared/pill";
import {  getStoredUserId, pointApi, quizApi, articleApi } from "@/lib/api";

function normalizeArticleQuiz(item, index) {
  const options = Array.isArray(item.options) ? item.options : [];
  const correctIndex =
    typeof item.correctIndex === "number"
      ? item.correctIndex
      : typeof item.correct_index === "number"
        ? item.correct_index
        : 0;

  return {
    id: `article-quiz-${index + 1}`,
    question: item.question || "퀴즈를 불러오지 못했어요.",
    options,
    correctIndex,
    explanation: item.explanation || "해설이 제공되지 않았어요.",
  };
}

function normalizeStaticQuiz(article) {
  if (!article?.quiz) {
    return [];
  }

  return [
    {
      id: "static-article-quiz",
      question: article.quiz.q,
      options: article.quiz.opts,
      correctIndex: article.quiz.ans,
      explanation: "기사 내용을 다시 확인해보세요.",
    },
  ];
}

export function ArticleView({ articleId, onBack, onHashtagClick }) {
  const { artQuizDone, setArtQuizDone, toast } = useApp();

  const [article, setArticle] = useState(null);
  const numericArticleId = Number(articleId);
  const canUseApi = Number.isFinite(numericArticleId);

  const [quizzes, setQuizzes] = useState(() => normalizeStaticQuiz(article));
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(canUseApi);
  const [quizError, setQuizError] = useState("");

  const quizStateKey = useMemo(() => {
    return `article-${articleId}`;
  }, [articleId]);

  useEffect(() => {
      const fetchArticle = async () => {
        try {
          const data = await articleApi.getArticleDetail(articleId);

          console.log("기사 상세", data);

          setArticle(data);
        } catch (error) {
          console.error("기사 상세 조회 실패:", error);
        }
      };

      fetchArticle();
    }, [articleId]);

  useEffect(() => {
    const fetchArticleQuiz = async () => {
      if (!canUseApi) {
        setQuizzes(normalizeStaticQuiz(article));
        setIsLoadingQuiz(false);
        return;
      }

      try {
        setIsLoadingQuiz(true);
        setQuizError("");

        const data = await quizApi.getArticleQuiz(numericArticleId);
        const quizList = Array.isArray(data) ? data : [];

        if (!quizList.length) {
          setQuizzes([]);
          setQuizError("이 기사에 연결된 퀴즈가 아직 없어요.");
          return;
        }

        setQuizzes(quizList.map(normalizeArticleQuiz));
      } catch (error) {
        console.error("기사별 퀴즈 조회 실패:", error);
        setQuizzes(normalizeStaticQuiz(article));
        setQuizError("");
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    fetchArticleQuiz();
  }, [article, canUseApi, numericArticleId]);

  if (!article) {
    return null;
  }

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
      console.error("기사 퀴즈 결과 기록 실패:", error);
    }
  };

  const requestNewsQuizReward = async () => {
    const userId = getStoredUserId();

    if (!userId || !canUseApi) {
      return;
    }

    try {
      const result = await pointApi.rewardNewsDetailQuiz({
        userId,
        articleId: numericArticleId,
      });

      if (result?.awarded && result?.pointsAwarded > 0) {
        toast(`🎁 뉴스 퀴즈 보상 +${result.pointsAwarded}P 적립!`);
      }
    } catch (error) {
      console.error("뉴스 상세 퀴즈 보상 실패:", error);
    }
  };

  const handleQuizAnswer = async (quiz, quizIndex, selectedIndex) => {
    const quizDoneKey = `${quizStateKey}-${quiz.id}`;
    const quizDone = artQuizDone[quizDoneKey];

    if (quizDone) {
      return;
    }

    const isCorrect = selectedIndex === quiz.correctIndex;
    const correctAnswer = quiz.options[quiz.correctIndex] || "";

    setArtQuizDone({
      ...artQuizDone,
      [quizDoneKey]: {
        answered: true,
        correct: isCorrect,
        selected: selectedIndex,
        correctIndex: quiz.correctIndex,
      },
    });

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

    await requestNewsQuizReward();
  };

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#F7F3FF] pb-6">
      <button
        type="button"
        onClick={onBack}
        className="mx-4 mt-4 mb-3 text-[#7C3AED] text-[15px] font-bold"
      >
        ‹ 뉴스 목록으로
      </button>

      <article className="mx-4 bg-white rounded-[22px] p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <div
          className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-black mb-3"
          style={{ color: article.cc, backgroundColor: article.cb }}
        >
          {article.category}
        </div>

        <h1 className="text-[22px] font-black leading-snug text-[#1a1a2e] mb-3">
          {article.title}
        </h1>

        <div className="text-[13px] font-bold text-[#8888aa] mb-4">
          {article.source} · {article.publishedAt}
        </div>

        <div
          className="article-body text-[15px] leading-7 text-[#333]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="flex flex-wrap gap-2 mt-5">
          {article.tags?.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                onHashtagClick(tag.replace("#", ""));
                onBack();
              }}
            >
              <HashTag>{tag}</HashTag>
            </button>
          ))}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 block rounded-xl bg-[#F7F3FF] px-4 py-3 text-center text-[14px] font-black text-[#7C3AED]"
        >
          원문 보기 — {article.source} ↗
        </a>
      </article>

      <section className="mx-4 mt-4 bg-white rounded-[22px] p-5 shadow-[0_2px_16px_rgba(60,60,120,0.10)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-black text-[#1a1a2e]">
            뉴스 퀴즈 (+20P)
          </h2>
          {canUseApi && (
            <span className="text-[11px] font-bold text-[#7C3AED]">
              API 연동
            </span>
          )}
        </div>

        {isLoadingQuiz && (
          <div className="rounded-xl bg-[#F7F3FF] p-4 text-center text-[13px] font-bold text-[#7C3AED]">
            퀴즈를 불러오는 중이에요
          </div>
        )}

        {!isLoadingQuiz && quizError && (
          <div className="rounded-xl bg-[#FFF5F7] p-4 text-center text-[13px] font-bold text-[#c0243a]">
            {quizError}
          </div>
        )}

        {!isLoadingQuiz &&
          !quizError &&
          quizzes.map((quiz, quizIndex) => {
            const quizDoneKey = `${quizStateKey}-${quiz.id}`;
            const quizDone = artQuizDone[quizDoneKey];

            return (
              <div key={quiz.id} className="mb-4 last:mb-0">
                <p className="text-[15px] font-black text-[#1a1a2e] mb-3 leading-relaxed">
                  {quiz.question}
                </p>

                <div className="grid gap-2">
                  {quiz.options.map((option, index) => {
                    let buttonClass =
                      "py-2.5 px-3.5 border-2 rounded-[10px] text-sm font-bold bg-white cursor-pointer transition-all text-left";

                    if (quizDone) {
                      if (index === quizDone.correctIndex) {
                        buttonClass +=
                          " border-[#3CBBA2] bg-[rgba(60,187,162,0.12)] text-[#1a7a64]";
                      } else if (
                        index === quizDone.selected &&
                        !quizDone.correct
                      ) {
                        buttonClass +=
                          " border-[#FF4D6D] bg-[rgba(255,77,109,0.10)] text-[#c0243a]";
                      } else {
                        buttonClass +=
                          " border-[#e0d4ff] text-[#1a1a2e] opacity-50";
                      }
                    } else {
                      buttonClass +=
                        " border-[#e0d4ff] text-[#1a1a2e] hover:border-[#7C3AED] hover:text-[#7C3AED]";
                    }

                    return (
                      <button
                        key={`${quiz.id}-${option}-${index}`}
                        type="button"
                        className={buttonClass}
                        onClick={() =>
                          handleQuizAnswer(quiz, quizIndex, index)
                        }
                        disabled={!!quizDone}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    );
                  })}
                </div>

                {quizDone && (
                  <div
                    className={`mt-3 rounded-xl px-3 py-2 text-[12px] font-bold leading-relaxed ${
                      quizDone.correct
                        ? "bg-[rgba(60,187,162,0.12)] text-[#1a7a64]"
                        : "bg-[rgba(255,77,109,0.10)] text-[#c0243a]"
                    }`}
                  >
                    {quizDone.correct
                      ? "✅ 정답이에요!"
                      : `❌ 오답이에요. 정답은 ${String.fromCharCode(
                          65 + quizDone.correctIndex
                        )}번이에요.`}
                    <div className="mt-1 opacity-80">{quiz.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
      </section>
    </div>
  );
}
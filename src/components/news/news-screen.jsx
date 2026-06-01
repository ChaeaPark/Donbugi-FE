"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { NewsList } from "./news-list";
import { ArticleView } from "./article-view";

export function NewsScreen() {
  const { pendingArticleId, setPendingArticleId } = useApp();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 홈 카드에서 넘어온 기사 ID가 있으면 바로 상세 진입
  useEffect(() => {
    if (pendingArticleId) {
      setSelectedArticle(pendingArticleId);
      setPendingArticleId(null); // 소비 후 초기화
    }
  }, [pendingArticleId, setPendingArticleId]);

  if (selectedArticle) {
    return (
      <ArticleView
        articleId={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onHashtagClick={(tag) => {
          setSearchQuery(tag);
          setSelectedArticle(null);
        }}
      />
    );
  }

  return (
    <NewsList
      searchQuery={searchQuery}
      onSelectArticle={setSelectedArticle}
      onHashtagClick={setSearchQuery}
    />
  );
}
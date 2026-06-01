import apiClient, {
  clearAuth,
  getAccessToken,
  getStoredUserId,
  saveAuth,
} from "./axios";

export { clearAuth, getAccessToken, getStoredUserId, saveAuth };

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

const resolveUserId = (userId) => {
  const storedUserId = userId || getStoredUserId();

  if (!storedUserId) {
    throw new Error("userId가 없습니다. 로그인 후 다시 시도해주세요.");
  }

  return storedUserId;
};

export const authApi = {
  signup: async ({ email, password }) => {
    const response = await apiClient.post("/api/auth/signup", {
      email,
      password,
    });

    return response.data;
  },

  login: async ({ email, password }) => {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/api/auth/me");

    return response.data;
  },

  updateMe: async ({ nickname }) => {
    const response = await apiClient.patch("/api/auth/me", {
      nickname,
    });

    return response.data;
  },
};

export const mainApi = {
  getEconomicWeather: async () => {
    const response = await apiClient.get("/api/main/economic-weather");

    return response.data;
  },

  getKospi: async () => {
    const response = await apiClient.get("/api/main/kospi");

    return response.data;
  },
};
export const articleApi = {
  getArticleDetail: async (articleId) => {
    const response = await apiClient.get(`/api/articles/${articleId}`);
    return response.data;
  },

  getLatestArticles: async (limit = 30) => {
    const response = await apiClient.get("/api/articles/latest", {
      params: { limit },
    });
    return response.data;
  },

  getArticlesByCategory: async (perCategory = 10) => {
    const response = await apiClient.get("/api/articles/by-category", {
      params: { perCategory },
    });
    return response.data;
  },

  searchArticles: async (q, limit = 30) => {
    const response = await apiClient.get("/api/articles/search", {
      params: { q, limit },
    });
    return response.data;
  },
};

export const newsInterestApi = {
  saveRead: async ({ userId, category }) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.post("/api/news/interest/read", {
      userId: targetUserId,
      category,
    });

    return response.data;
  },

  getTrends: async ({ userId, top = 5 } = {}) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.get("/api/news/interest/trends", {
      params: {
        userId: targetUserId,
        top,
      },
    });

    return response.data;
  },
};

export const quizApi = {
  getArticleQuiz: async (articleId) => {
    const response = await apiClient.get(`/api/quiz/${articleId}`);

    return response.data;
  },

  getRandom: async (size = 3) => {
    const response = await apiClient.get("/api/quiz/random", {
      params: { size },
    });

    return response.data;
  },

  getRandomSession: async (size = 3) => {
    const response = await apiClient.get("/api/quiz/random-session", {
      params: { size },
    });

    return response.data;
  },

  saveAttempt: async ({
    userId,
    correct,
    question,
    userAnswer,
    correctAnswer,
    explanation,
  }) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.post("/api/quiz/stats/attempt", {
      userId: targetUserId,
      correct,
      question,
      userAnswer,
      correctAnswer,
      explanation,
    });

    return response.data;
  },

  getDashboard: async ({ userId } = {}) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.get("/api/quiz/stats/dashboard", {
      params: {
        userId: targetUserId,
      },
    });

    return response.data;
  },
};

export const pointApi = {
  getBenefits: async () => {
    const response = await apiClient.get("/api/point-benefits");

    return response.data;
  },

  getBalance: async (userId) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.get("/api/points/balance", {
      params: {
        userId: targetUserId,
      },
    });

    return response.data;
  },

  getMonthlySummary: async ({ userId, year, month } = {}) => {
    const targetUserId = resolveUserId(userId);

    const params = {
      userId: targetUserId,
    };

    if (year && month) {
      params.year = year;
      params.month = month;
    }

    const response = await apiClient.get("/api/points/monthly-summary", {
      params,
    });

    return response.data;
  },

  getRecentActivity: async (userId) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.get("/api/points/recent-activity", {
      params: {
        userId: targetUserId,
      },
    });

    return response.data;
  },

  checkAttendance: async ({ userId, date } = {}) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.post("/api/points/rewards/attendance", {
      userId: targetUserId,
      date: date || getTodayDate(),
    });

    return response.data;
  },

  getAttendanceStatus: async (userId) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.get(
      "/api/points/rewards/attendance/status",
      {
        params: {
          userId: targetUserId,
        },
      }
    );

    return response.data;
  },

  rewardDailyQuiz: async ({ userId, sessionId, results }) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.post("/api/points/rewards/daily-quiz", {
      userId: targetUserId,
      sessionId,
      results,
    });

    return response.data;
  },

  rewardNewsDetailQuiz: async ({ userId, articleId }) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.post(
      "/api/points/rewards/news-detail-quiz",
      {
        userId: targetUserId,
        articleId,
      }
    );

    return response.data;
  },

  redeem: async ({ userId, email, benefitCode }) => {
    const targetUserId = resolveUserId(userId);

    const response = await apiClient.post("/api/points/redeem", {
      userId: targetUserId,
      email,
      benefitCode,
    });

    return response.data;
  },
};

export const notificationApi = {
  getNotifications: async () => {
    const response = await apiClient.get("/api/notifications");

    return response.data;
  },

  readAll: async () => {
    const response = await apiClient.patch("/api/notifications/read-all");

    return response.data;
  },
};
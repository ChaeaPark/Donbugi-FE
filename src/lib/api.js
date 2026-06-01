const API_BASE_URL = "https://donbugi.xyz";

export const TOKEN_KEY = "donbugi_access_token";
export const USER_ID_KEY = "donbugi_user_id";

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(USER_ID_KEY);
}

export function saveAuth({ accessToken, userId }) {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  }

  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
  }
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

async function request(path, options = {}) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || "API 요청에 실패했습니다."
        : data || "API 요청에 실패했습니다.";

    throw new Error(message);
  }

  return data;
}

export const authApi = {
  signup: ({ email, password }) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: ({ email, password }) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request("/api/auth/me"),

  updateMe: ({ nickname }) =>
    request("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ nickname }),
    }),
};

export const mainApi = {
  getEconomicWeather: () => request("/api/main/economic-weather"),

  getKospi: () => request("/api/main/kospi"),
};

export const articleApi = {
  getLatest: (limit = 30) =>
    request(`/api/articles/latest?limit=${encodeURIComponent(limit)}`),

  getByCategory: (perCategory = 10) =>
    request(
      `/api/articles/by-category?perCategory=${encodeURIComponent(perCategory)}`
    ),

  search: ({ q, limit = 30 }) =>
    request(
      `/api/articles/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(
        limit
      )}`
    ),

  getDetail: (articleId) => request(`/api/articles/${articleId}`),
};

export const newsInterestApi = {
  saveRead: ({ userId, category }) =>
    request("/api/news/interest/read", {
      method: "POST",
      body: JSON.stringify({ userId, category }),
    }),

  getTrends: ({ userId, top = 5 } = {}) => {
    const params = new URLSearchParams();

    if (userId) {
      params.set("userId", userId);
    }

    params.set("top", String(top));

    return request(`/api/news/interest/trends?${params.toString()}`);
  },
};

export const quizApi = {
  getArticleQuiz: (articleId) => request(`/api/quiz/${articleId}`),

  getRandom: (size = 3) =>
    request(`/api/quiz/random?size=${encodeURIComponent(size)}`),

  getRandomSession: (size = 3) =>
    request(`/api/quiz/random-session?size=${encodeURIComponent(size)}`),

  saveAttempt: ({
    userId,
    correct,
    question,
    userAnswer,
    correctAnswer,
    explanation,
  }) =>
    request("/api/quiz/stats/attempt", {
      method: "POST",
      body: JSON.stringify({
        userId,
        correct,
        question,
        userAnswer,
        correctAnswer,
        explanation,
      }),
    }),

  getDashboard: ({ userId } = {}) => {
    const params = new URLSearchParams();

    if (userId) {
      params.set("userId", userId);
    }

    const queryString = params.toString();

    return request(
      queryString
        ? `/api/quiz/stats/dashboard?${queryString}`
        : "/api/quiz/stats/dashboard"
    );
  },
};

export const pointApi = {
  getBenefits: () => request("/api/point-benefits"),

  getBalance: (userId) =>
    request(`/api/points/balance?userId=${encodeURIComponent(userId)}`),

  earn: ({ userId, amount, title, detail }) =>
    request("/api/points/earn", {
      method: "POST",
      body: JSON.stringify({ userId, amount, title, detail }),
    }),

  getMonthlySummary: ({ userId, year, month }) =>
    request(
      `/api/points/monthly-summary?userId=${encodeURIComponent(
        userId
      )}&year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`
    ),

  getRecentActivity: (userId) =>
    request(`/api/points/recent-activity?userId=${encodeURIComponent(userId)}`),

  redeem: ({ userId, email, benefitCode }) =>
    request("/api/points/redeem", {
      method: "POST",
      body: JSON.stringify({ userId, email, benefitCode }),
    }),

  checkAttendance: ({ userId, date }) =>
    request("/api/points/rewards/attendance", {
      method: "POST",
      body: JSON.stringify({ userId, date }),
    }),

  getAttendanceStatus: (userId) =>
    request(
      `/api/points/rewards/attendance/status?userId=${encodeURIComponent(
        userId
      )}`
    ),

  rewardDailyQuiz: ({ userId, sessionId, results }) =>
    request("/api/points/rewards/daily-quiz", {
      method: "POST",
      body: JSON.stringify({ userId, sessionId, results }),
    }),

  rewardNewsDetailQuiz: ({ userId, articleId }) =>
    request("/api/points/rewards/news-detail-quiz", {
      method: "POST",
      body: JSON.stringify({ userId, articleId }),
    }),
};

export const notificationApi = {
  getNotifications: () => request("/api/notifications"),

  readAll: () =>
    request("/api/notifications/read-all", {
      method: "PATCH",
    }),
};
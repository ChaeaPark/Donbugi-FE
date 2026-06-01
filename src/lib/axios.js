import axios from "axios";

export const TOKEN_KEY = "donbugi_access_token";
export const USER_ID_KEY = "donbugi_user_id";
export const NICKNAME_KEY = "donbugi_nickname";
export const USER_CHAR_KEY = "donbugi_user_char";
export const CURRENT_TAB_KEY = "donbugi_current_tab";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem(TOKEN_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      "API 요청에 실패했습니다.";

    return Promise.reject(
      new Error(
        typeof message === "string" ? message : "API 요청에 실패했습니다."
      )
    );
  }
);

export function saveAuth({ accessToken, userId }) {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
  }

  if (userId) {
    sessionStorage.setItem(USER_ID_KEY, userId);
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(CURRENT_TAB_KEY);

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(CURRENT_TAB_KEY);
  localStorage.removeItem(NICKNAME_KEY);
  localStorage.removeItem(USER_CHAR_KEY);
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(USER_ID_KEY);
}

export default apiClient;
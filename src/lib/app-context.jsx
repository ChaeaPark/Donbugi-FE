"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const TOKEN_KEY = "donbugi_access_token";
const USER_ID_KEY = "donbugi_user_id";
const NICKNAME_KEY = "donbugi_nickname";
const USER_CHAR_KEY = "donbugi_user_char";
const CURRENT_TAB_KEY = "donbugi_current_tab";

// Character data
export const CHARS = [
  {
    lv: 1,
    emoji: "🐥",
    name: "병아리",
    tag: "금융 입문 단계",
    desc: "이제 금융의 세계에 발을 내딛은 단계예요!\n매일 조금씩 뉴스를 읽다 보면 금방 성장할 수 있어요.",
    features: [
      "금융 뉴스가 아직 낯설어요",
      "기초부터 차근차근 배우는 중",
      "성장 가능성이 가장 높은 단계!",
    ],
    lvLabel: "Lv.1",
  },
  {
    lv: 2,
    emoji: "🐿️",
    name: "다람쥐",
    tag: "정보 수집 단계",
    desc: "부지런히 정보를 모으는 단계예요!\n조금 더 깊이 읽으면 여우가 될 수 있어요.",
    features: [
      "뉴스는 보지만 깊이가 부족해요",
      "중요한 정보를 골라내는 눈이 생겼어요",
      "꾸준한 학습으로 도약 직전!",
    ],
    lvLabel: "Lv.2",
  },
  {
    lv: 3,
    emoji: "🦊",
    name: "여우",
    tag: "분석 단계",
    desc: "정보를 읽고 판단까지 할 수 있는 단계예요!\n전략적 사고를 더하면 사자가 될 수 있어요.",
    features: [
      "금융 정보를 이해하고 판단할 수 있어요",
      "흐름을 읽는 감각이 있어요",
      "주관적인 투자 관점이 생겨가고 있어요",
    ],
    lvLabel: "Lv.3",
  },
  {
    lv: 4,
    emoji: "🦁",
    name: "사자",
    tag: "전략 단계",
    desc: "금융 습관과 경험을 모두 갖춘 전략가예요!\n돈부기로 더욱 날카롭게 성장해보세요.",
    features: [
      "금융 흐름을 읽고 전략을 세울 수 있어요",
      "투자 경험과 분석력을 갖추고 있어요",
      "시장을 리드하는 투자자!",
    ],
    lvLabel: "Lv.4",
  },
  {
    lv: 5,
    emoji: "🐉",
    name: "용",
    tag: "금융 전문가 단계",
    desc: "금융 흐름을 깊이 이해하고 금융 이벤트에 논리적으로 판단하는 최고 단계예요!\n돈부기와 함께 전문가 수준의 인사이트를 나눠보세요.",
    features: [
      "금융 이벤트에 논리적 판단이 가능해요",
      "시장 흐름과 자산 영향을 통합적으로 분석해요",
      "전문가 수준의 금융 리터러시를 보유하고 있어요",
    ],
    lvLabel: "Lv.5",
  },
];

// Onboarding questions
export const OBQ = [
  {
    q: "경제/금융 뉴스는 얼마나 보시나요?",
    sub: "정보 소비 습관",
    opts: [
      { e: "😴", t: "거의 안 본다" },
      { e: "👀", t: "가끔 제목만 본다" },
      { e: "📖", t: "관심 있는 건 읽는다" },
      { e: "🔍", t: "꾸준히 챙겨본다" },
    ],
  },
  {
    q: "뉴스 볼 때 당신의 스타일은?",
    sub: "금융 문해력 레벨",
    opts: [
      { e: "😵", t: "어려워서 대충 넘김" },
      { e: "⚡", t: "중요한 부분만 본다" },
      { e: "🤔", t: "이해하려고 읽는다" },
      { e: "📊", t: "흐름까지 분석한다" },
    ],
  },
  {
    q: "당신의 투자 경험은?",
    sub: "금융 경험 수준",
    opts: [
      { e: "🌱", t: "해본 적 없음" },
      { e: "🏦", t: "예금/적금만" },
      { e: "📈", t: "ETF/주식 조금" },
      { e: "💼", t: "적극적으로 투자" },
    ],
  },
  {
    q: "새로운 금융 용어를 보면 어떻게 하시나요?",
    sub: "금융 학습 태도",
    opts: [
      { e: "🙈", t: "그냥 넘긴다" },
      { e: "🤏", t: "대충 느낌만 파악한다" },
      { e: "💡", t: "소비/저축에 영향 있을지 생각한다" },
      { e: "🧠", t: "시장·자산 영향을 따져본다" },
    ],
  },
];

// KOSPI status data
export const KOSPI_STATUS = {
  sunny: {
    icon: "☀️",
    label: "맑음",
    name: "☀️ 맑음",
    desc: "시장이 전반적으로 안정적으로 상승하는 상태",
    reason:
      "· 코스피 +1.8% 상승 마감\n· 반도체·2차전지 강세\n· 외국인 순매수 4,200억 원\n· 거래량 전일 대비 142% 증가\n· 시장 공포탐욕지수: 72 (탐욕 구간)",
  },
  warm: {
    icon: "🌤",
    label: "포근함",
    name: "🌤 포근함",
    desc: "큰 변동 없이 완만하게 좋은 흐름을 보이는 상태",
    reason:
      "· 코스피 +0.4% 소폭 상승 마감\n· 업종 고른 상승, 변동성 낮음\n· 외국인 소폭 순매수\n· 거래량 평이한 수준 유지\n· 시장 공포탐욕지수: 58 (약한 탐욕)",
  },
  cloudy: {
    icon: "☁️",
    label: "구름낌",
    name: "☁️ 구름낌",
    desc: "상승과 하락 신호가 섞여 방향이 불분명한 상태",
    reason:
      "· 코스피 ±0.1% 보합 마감\n· 업종 혼재, 방향성 부재\n· 외국인 소폭 순매수\n· 미국 경제지표 발표 대기 중\n· 시장 공포탐욕지수: 52 (중립)",
  },
  rainy: {
    icon: "🌧",
    label: "비",
    name: "🌧 비",
    desc: "시장이 전반적으로 하락하며 투자 심리가 위축된 상태",
    reason:
      "· 코스피 -1.2% 하락 마감\n· 반도체·바이오 약세\n· 외국인 순매도 2,800억 원\n· 미국 국채금리 상승 여파\n· 시장 공포탐욕지수: 35 (공포 구간)",
  },
  storm: {
    icon: "⛈",
    label: "폭풍",
    name: "⛈ 폭풍",
    desc: "급락이나 높은 변동성으로 시장 불안이 큰 상태",
    reason:
      "· 코스피 -3.1% 급락 마감\n· 전 업종 동반 하락\n· 외국인 대규모 순매도\n· 글로벌 불확실성 고조\n· 시장 공포탐욕지수: 18 (극단적 공포)",
  },
  hot: {
    icon: "🔥",
    label: "뜨거움",
    name: "🔥 뜨거움",
    desc: "상승세와 거래 열기가 매우 강해 과열 분위기가 나타나는 상태",
    reason:
      "· 코스피 +2.9% 급등 마감\n· 반도체·AI 관련 종목 과열\n· 거래대금 역대 최고 수준\n· 개인 투자자 매수세 폭증\n· 시장 공포탐욕지수: 88 (극단적 탐욕)",
  },
};

// Articles data
export const ARTS = {
  nvda: {
    cat: "🔬 반도체",
    cc: "#7C3AED",
    cb: "rgba(124,58,237,.1)",
    title: "엔비디아, AI 칩 수요 폭발로 분기 매출 최고 기록",
    src: "한국경제",
    dt: "2026.03.26",
    tags: ["#반도체", "#AI전쟁", "#엔비디아"],
    body: '<p>엔비디아가 2026년 1분기 실적을 발표하며 사상 최대 매출을 기록했습니다. 데이터센터 부문 매출은 전년 동기 대비 200% 성장하며 시장 예상치를 크게 상회했습니다.</p><p>젠슨 황 CEO는 "AI 인프라에 대한 기업들의 투자가 가속화되고 있다"고 밝혔습니다. 특히 차세대 AI 칩 블랙웰의 수요가 공급을 크게 앞지르고 있어 생산 확대에 집중하고 있다고 설명했습니다.</p><p>월가 애널리스트들은 클라우드 서비스 기업과 AI 스타트업들의 GPU 수요가 당분간 지속될 것으로 전망하며, 엔비디아의 시장 지배력은 더욱 강화될 것으로 분석했습니다.</p>',
    url: "https://www.hankyung.com",
    quiz: {
      q: "엔비디아 데이터센터 매출 성장률은?",
      opts: ["100%", "150%", "200%", "250%"],
      ans: 2,
    },
  },
  realestate: {
    cat: "🏠 부동산",
    cc: "#3CBBA2",
    cb: "rgba(60,187,162,.1)",
    title: "서울 아파트 거래량 4개월 연속 증가세",
    src: "매일경제",
    dt: "2026.03.26",
    tags: ["#부동산", "#금리인하", "#서울아파트"],
    body: "<p>서울 아파트 거래량이 4개월 연속 증가세를 이어가고 있습니다. 금리 인하 기대감에 실수요자 중심으로 시장이 회복되는 모습입니다.</p><p>국토교통부에 따르면 3월 서울 아파트 거래량은 전월 대비 15% 증가했으며, 특히 중소형 아파트 위주로 거래가 활발합니다.</p><p>전문가들은 금리 인하가 본격화되면 거래량 증가세가 더욱 뚜렷해질 것으로 전망하면서도, 급격한 가격 상승보다는 안정적인 회복이 예상된다고 분석했습니다.</p>",
    url: "https://www.mk.co.kr",
    quiz: {
      q: "서울 아파트 거래 증가의 주요 원인은?",
      opts: ["공급 부족", "금리 인하 기대감", "외국인 투자", "재건축 호재"],
      ans: 1,
    },
  },
  fed: {
    cat: "🌐 글로벌",
    cc: "#FF9F1C",
    cb: "rgba(255,159,28,.1)",
    title: "미 연준, 올해 금리 인하 횟수 조정 시사",
    src: "Bloomberg",
    dt: "2026.03.26",
    tags: ["#금리인상", "#연준", "#인플레이션"],
    body: "<p>미국 연방준비제도(연준)가 올해 금리 인하 횟수를 기존 계획보다 축소할 수 있음을 시사했습니다. 파월 의장은 인플레이션 목표 달성 전까지 신중한 접근이 필요하다고 강조했습니다.</p><p>최근 발표된 경제지표에서 인플레이션이 예상보다 끈적끈적하게 유지되고 있어, 연준은 금리 인하 시기를 늦출 가능성을 열어두고 있습니다.</p><p>시장에서는 이러한 연준의 스탠스 변화에 주목하며, 달러 강세와 미국 국채금리 상승이 나타나고 있습니다.</p>",
    url: "https://www.bloomberg.com",
    quiz: {
      q: "연준이 목표로 하는 인플레이션 수치는?",
      opts: ["1%", "2%", "3%", "4%"],
      ans: 1,
    },
  },
  btc: {
    cat: "💰 가상화폐",
    cc: "#FF9F1C",
    cb: "rgba(255,159,28,.1)",
    title: "비트코인, ETF 자금 유입에 다시 8만 달러 돌파 시도",
    src: "CoinDesk",
    dt: "2026.03.26",
    tags: ["#비트코인", "#ETF", "#가상화폐"],
    body: "<p>비트코인이 현물 ETF를 통한 기관 자금 유입 재개로 다시 8만 달러 돌파를 시도하고 있습니다. 블랙록과 피델리티 등 주요 운용사의 비트코인 ETF로 대규모 자금이 유입되고 있습니다.</p><p>전문가들은 기관 투자자들의 참여가 본격화되면서 비트코인의 변동성이 줄어들고 자산으로서의 신뢰도가 높아지고 있다고 분석합니다.</p><p>다만 일부 애널리스트는 단기 과열 신호에 주의해야 한다며, 조정 가능성도 함께 언급했습니다.</p>",
    url: "https://www.coindesk.com",
    quiz: {
      q: "비트코인 ETF 자금 유입을 이끄는 주요 자산운용사가 아닌 것은?",
      opts: ["블랙록", "피델리티", "삼성자산운용", "뱅가드"],
      ans: 2,
    },
  },
};

// Calendar system events
export const SYS_EVS = {
  "2026-3-10": [
    {
      t: "한국은행 금통위",
      tm: "오전 10:00",
      c: "#7C3AED",
      desc: "기준금리 결정 발표",
    },
  ],
  "2026-3-19": [
    {
      t: "미국 FOMC 회의",
      tm: "오후 11:00",
      c: "#FF9F1C",
      desc: "연방공개시장위원회 금리 결정",
    },
  ],
  "2026-3-26": [
    {
      t: "미국 CPI 발표",
      tm: "오후 9:30",
      c: "#FF4D6D",
      desc: "소비자물가지수 발표",
    },
    {
      t: "삼성전자 주총",
      tm: "오전 9:00",
      c: "#3CBBA2",
      desc: "정기 주주총회",
    },
  ],
  "2026-3-27": [
    {
      t: "한국 2월 산업생산",
      tm: "오전 8:00",
      c: "#FF9F1C",
      desc: "통계청 산업활동동향 발표",
    },
  ],
  "2026-4-2": [
    {
      t: "美 고용지표 발표",
      tm: "오후 9:30",
      c: "#FF9F1C",
      desc: "비농업 취업자 수 발표",
    },
  ],
};

function loadNicknameFromBrowser() {
  if (typeof window === "undefined") {
    return "닉네임";
  }

  return localStorage.getItem(NICKNAME_KEY) || "닉네임";
}

function loadCharacterFromBrowser() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedCharacter = localStorage.getItem(USER_CHAR_KEY);

  if (!savedCharacter) {
    return null;
  }

  try {
    return JSON.parse(savedCharacter);
  } catch (error) {
    console.error("캐릭터 정보 불러오기 실패:", error);
    return null;
  }
}

function loadCurrentTabFromBrowser() {
  if (typeof window === "undefined") {
    return "home";
  }

  return sessionStorage.getItem(CURRENT_TAB_KEY) || "home";
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  const [currentScreen, setCurrentScreen] = useState("auth");
  const [currentTabState, setCurrentTabState] = useState("home");

  const [userNick, setUserNickState] = useState("닉네임");
  const [userChar, setUserCharState] = useState(null);

  const [obStep, setObStep] = useState(0);
  const [obScores, setObScores] = useState([0, 0, 0, 0]);

  const [qDone, setQDone] = useState({});
  const [artQuizDone, setArtQuizDone] = useState({});

  const [userEvents, setUserEvents] = useState({});

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifBadge, setNotifBadge] = useState(2);

  const [marketTempOpen, setMarketTempOpen] = useState(false);
  const [currentKospiStatus, setCurrentKospiStatus] = useState("sunny");
  const [economicWeather, setEconomicWeather] = useState(null);

  const [alertPopOpen, setAlertPopOpen] = useState(false);
  const [alertPopData, setAlertPopData] = useState({});

  const [addEventOpen, setAddEventOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const savedNickname = loadNicknameFromBrowser();
    const savedCharacter = loadCharacterFromBrowser();
    const savedTab = loadCurrentTabFromBrowser();

    setUserNickState(savedNickname);
    setUserCharState(savedCharacter);

    if (token) {
      setCurrentScreen("main");
      setCurrentTabState(savedTab);
    } else {
      setCurrentScreen("auth");
      setCurrentTabState("home");
      sessionStorage.removeItem(CURRENT_TAB_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(CURRENT_TAB_KEY);
    }

    setIsReady(true);
  }, []);

  const setCurrentTab = useCallback((tab) => {
    setCurrentTabState(tab);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(CURRENT_TAB_KEY, tab);
    }
  }, []);

  const setUserNick = useCallback((nickname) => {
    setUserNickState(nickname);

    if (typeof window !== "undefined" && nickname && nickname !== "닉네임") {
      localStorage.setItem(NICKNAME_KEY, nickname);
    }
  }, []);

  const setUserChar = useCallback((character) => {
    setUserCharState(character);

    if (typeof window !== "undefined" && character) {
      localStorage.setItem(USER_CHAR_KEY, JSON.stringify(character));
    }
  }, []);

  const toast = useCallback((msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const goToScreen = useCallback((screen) => {
    setCurrentScreen(screen);
  }, []);

  const goToTab = useCallback(
    (tab) => {
      setCurrentTab(tab);
      setCurrentScreen("main");
    },
    [setCurrentTab]
  );

  const value = {
    isReady,

    currentScreen,
    setCurrentScreen,
    currentTab: currentTabState,
    setCurrentTab,
    goToScreen,
    goToTab,

    userNick,
    setUserNick,
    userChar,
    setUserChar,

    obStep,
    setObStep,
    obScores,
    setObScores,

    qDone,
    setQDone,
    artQuizDone,
    setArtQuizDone,

    userEvents,
    setUserEvents,

    toast,
    toastMessage,
    toastVisible,

    notifOpen,
    setNotifOpen,
    notifBadge,
    setNotifBadge,

    marketTempOpen,
    setMarketTempOpen,
    currentKospiStatus,
    setCurrentKospiStatus,

    economicWeather,
    setEconomicWeather,

    alertPopOpen,
    setAlertPopOpen,
    alertPopData,
    setAlertPopData,

    addEventOpen,
    setAddEventOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  const [economicWeather, setEconomicWeather] = useState(null);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
}
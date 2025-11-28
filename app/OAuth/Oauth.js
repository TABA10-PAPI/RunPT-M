import NaverLogin from "@react-native-seoul/naver-login";

const KAKAO_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_API_KEY;
const KAKAO_REDIRECT_URI =
  process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

const CLIENT_ID_NAVER =
  process.env.EXPO_PUBLIC_NAVER_API_KEY;
const CLIENT_SECRET_NAVER =
  process.env.EXPO_PUBLIC_NAVER_SECRET_KEY;
const REDIRECT_URI_NAVER =
  process.env.EXPO_PUBLIC_NAVER_REDIRECT_URI;
const STATE = "RANDOM_STRING";

// API 엔드포인트 경로 (상대 경로만 사용, apiClient의 baseURL과 결합됨)
// API 엔드포인트 경로 (apiClient의 baseURL과 결합됨)
export const KAKAO_CALLBACK_URL = "/user/kakao-login";
export const NAVER_CALLBACK_URL = "/user/naver-login";

// 네이버 네이티브 로그인용 설정
export const NAVER_CONSUMER_KEY = CLIENT_ID_NAVER;
export const NAVER_CONSUMER_SECRET = CLIENT_SECRET_NAVER;
export const NAVER_APP_NAME = "RunPT";

// 네이버 로그인 초기화 함수
export const initializeNaverLogin = () => {
  if (NAVER_CONSUMER_KEY && NAVER_CONSUMER_SECRET) {
    NaverLogin.initialize({
      appName: NAVER_APP_NAME,
      consumerKey: NAVER_CONSUMER_KEY,
      consumerSecret: NAVER_CONSUMER_SECRET,
    });
  }
};

export const KAKAO_AUTH_URL =
  KAKAO_API_KEY && KAKAO_REDIRECT_URI
    ? `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_API_KEY}&redirect_uri=${encodeURIComponent(
        KAKAO_REDIRECT_URI
      )}&response_type=code`
    : "";

export const NAVER_AUTH_URL =
  CLIENT_ID_NAVER && REDIRECT_URI_NAVER
    ? `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID_NAVER}&state=${STATE}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI_NAVER
      )}`
    : "";


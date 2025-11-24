const KAKAO_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_API_KEY;
const KAKAO_REDIRECT_URI =
  process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

const CLIENT_ID_NAVER =
  process.env.EXPO_PUBLIC_NAVER_API_KEY;
const REDIRECT_URI_NAVER =
  process.env.EXPO_PUBLIC_NAVER_REDIRECT_URI;
const STATE = "RANDOM_STRING";

export const KAKAO_CALLBACK_URL = process.env.EXPO_PUBLIC_BASE_URL + "/auth/kakao";
export const NAVER_CALLBACK_URL = process.env.EXPO_PUBLIC_BASE_URL + "/auth/naver";

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


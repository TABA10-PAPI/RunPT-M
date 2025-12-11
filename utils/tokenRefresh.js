import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import axios from "axios";
import { CLIENT_ID_NAVER, CLIENT_SECRET_NAVER } from "@app/OAuth/Oauth";

/**
 * 저장된 OAuth provider 정보를 확인하고 refreshToken으로 토큰 갱신
 * @returns {Promise<string|null>} 갱신된 accessToken 또는 null
 */
export const refreshAccessToken = async () => {
  try {
    // 어떤 OAuth provider를 사용했는지 확인 (카카오 또는 네이버)
    const oauthProvider = await AsyncStorage.getItem("oauthProvider");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("RefreshToken이 없습니다.");
      return null;
    }

    if (oauthProvider === "kakao") {
      // 카카오: login()을 다시 호출하면 자동으로 refreshToken으로 갱신 시도
      try {
        const kakaoToken = await kakaoLogin();
        
        if (kakaoToken && kakaoToken.accessToken) {
          const newAccessToken = kakaoToken.accessToken;
          await AsyncStorage.setItem("accessToken", newAccessToken);
          
          // 새로운 refreshToken도 저장 (갱신될 수 있음)
          if (kakaoToken.refreshToken) {
            await AsyncStorage.setItem("refreshToken", kakaoToken.refreshToken);
          }
          
          console.log("카카오 토큰 갱신 성공");
          return newAccessToken;
        }
      } catch (kakaoError) {
        console.error("카카오 토큰 갱신 오류:", kakaoError);
        return null;
      }
    } else if (oauthProvider === "naver") {
      // 네이버: 네이버 API를 직접 호출하여 refreshToken으로 갱신
      try {
        const response = await axios.post(
          "https://nid.naver.com/oauth2.0/token",
          null,
          {
            params: {
              grant_type: "refresh_token",
              client_id: CLIENT_ID_NAVER,
              client_secret: CLIENT_SECRET_NAVER,
              refresh_token: refreshToken,
            },
          }
        );

        if (response.data && response.data.access_token) {
          const newAccessToken = response.data.access_token;
          await AsyncStorage.setItem("accessToken", newAccessToken);
          
          // 새로운 refreshToken도 저장 (갱신될 수 있음)
          if (response.data.refresh_token) {
            await AsyncStorage.setItem("refreshToken", response.data.refresh_token);
          }
          
          console.log("네이버 토큰 갱신 성공");
          return newAccessToken;
        }
      } catch (naverError) {
        console.error("네이버 토큰 갱신 오류:", naverError);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("토큰 갱신 오류:", error);
    return null;
  }
};

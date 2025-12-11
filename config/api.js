import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "@utils/tokenRefresh";

// API Base URL - 환경 변수로 관리하거나 실제 서버 URL로 변경
const API_BASE_URL = "http://52.78.76.223:8080";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refreshToken으로 토큰 갱신 시도
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          // 갱신 성공: 새로운 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          // 갱신 실패: 토큰 제거
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          await AsyncStorage.removeItem("oauthProvider");
          // navigation을 여기서 직접 사용할 수 없으므로 각 컴포넌트에서 처리
        }
      } catch (refreshError) {
        // 갱신 중 에러 발생: 토큰 제거
        console.error("토큰 갱신 중 오류:", refreshError);
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("oauthProvider");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

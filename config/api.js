import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Base URL - 환경 변수로 관리하거나 실제 서버 URL로 변경
const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

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

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 이동
      await AsyncStorage.removeItem("accessToken");
      // navigation을 여기서 직접 사용할 수 없으므로 각 컴포넌트에서 처리
    }
    return Promise.reject(error);
  }
);

export default apiClient;

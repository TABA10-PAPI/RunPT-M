import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NaverLogin from "@react-native-seoul/naver-login";
import apiClient from "@config/api";
import { NAVER_CALLBACK_URL, initializeNaverLogin } from "./Oauth";
import { useUid } from "@hooks/UseUid";

export default function NaverCallback() {
  const navigation = useNavigation();
  const { setUid } = useUid();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        // 네이버 로그인 초기화
        initializeNaverLogin();
        
        // 1) 네이버 네이티브 로그인
        const { failureResponse, successResponse } = await NaverLogin.login();

        if (failureResponse) {
          throw new Error(failureResponse.message || "네이버 로그인에 실패했습니다.");
        }

        if (!successResponse || !successResponse.accessToken) {
          throw new Error("네이버 토큰을 받을 수 없습니다.");
        }

        const accessToken = successResponse.accessToken;
        
        // 날짜 포맷팅 (YYYY-MM-DD) - 카카오 로그인과 동일한 형식
        const date = new Date().toISOString().split('T')[0];
        
        // 백엔드로 전송할 데이터
        const requestData = {
          accessToken,
          date,
        };
        
        console.log("[NaverCallback] 백엔드로 전송하는 데이터:", {
          accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : "없음",
          date,
        });
        
        // 백엔드로 토큰 전송
        const response = await apiClient.post(NAVER_CALLBACK_URL, requestData);

        const { code: responseCode, message, uid, fresh, new_user, default_nickname } = response.data;
        
        // uid를 저장하지 않고, Join 화면에서만 사용하도록 함
        // (Join 화면에서 저장하도록 변경하여 자동 리다이렉트 방지)

        // fresh 또는 new_user 필드 확인 (백엔드 응답에 따라 다를 수 있음)
        // fresh가 true이거나 new_user가 true이면 새 사용자
        const isNewUser = fresh === true || new_user === true;

        if (isNewUser) {
          // uid는 Join 화면에서 저장하도록 하지 않고, Join 완료 후에만 저장
          navigation.navigate("Join", { uid, default_nickname });
        } else {
          // 기존 사용자는 uid를 저장하고 Home으로 이동
          if (uid) {
            await setUid(uid);
          }
          navigation.navigate("Home");
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message 
          || err?.message 
          || "알 수 없는 오류가 발생했습니다.";
        
        Alert.alert(
          "로그인 오류",
          `네이버 로그인 중 문제가 발생했습니다.\n\n${errorMessage}`,
          [
            {
              text: "확인",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    };

    handleLogin();
  }, [navigation, setUid]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#03C75A" />
        <Text style={styles.message}>네이버 로그인 처리 중...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090909",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

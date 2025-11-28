import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "@react-native-seoul/kakao-login";
import apiClient from "@config/api";
import { KAKAO_CALLBACK_URL } from "./Oauth";
import { useUid } from "@hooks/UseUid";

export default function KakaoCallback() {
  const navigation = useNavigation();
  const { setUid } = useUid();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        // 1) 카카오 네이티브 로그인
        const kakaoToken = await login();

        if (!kakaoToken || !kakaoToken.accessToken) {
          throw new Error("카카오 토큰을 받을 수 없습니다.");
        }

        const accessToken = kakaoToken.accessToken;
        
        // 날짜 포맷팅 (YYYY-MM-DD)
        const date = new Date().toISOString().split('T')[0];
        
        // 백엔드로 토큰 전송
        const response = await apiClient.post(KAKAO_CALLBACK_URL, {
          accessToken,
          date,
        });

        const { code, message, uid, fresh, nickname } = response.data;
        const default_nickname = nickname;

        // uid를 저장 (useUid 훅 사용)
        if (uid) {
          await setUid(uid);
        }

        if (fresh) {
          navigation.navigate("Join", { uid, default_nickname });
        } else {
          navigation.navigate("Home");
        }
      } catch (err) {
        const errorMessage = err?.message || "알 수 없는 오류가 발생했습니다.";
        Alert.alert(
          "로그인 오류",
          `카카오 로그인 중 문제가 발생했습니다.\n\n${errorMessage}\n\n카카오톡 앱이 설치되어 있는지 확인해주세요.`,
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
        <ActivityIndicator size="large" color="#DAFD2E" />
        <Text style={styles.message}>카카오 로그인 처리 중...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#090909" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  message: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});

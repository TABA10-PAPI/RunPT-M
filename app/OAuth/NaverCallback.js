import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@config/api";
import { NAVER_CALLBACK_URL } from "./Oauth";


export default function NaverCallback() {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const code = route.params?.code;
    const state = route.params?.state;

    const sendCodeToBackend = async () => {
      if (!code) {
        Alert.alert("로그인 오류", "인가 코드가 전달되지 않았습니다.");
        navigation.navigate("Login");
        return;
      }

      try {
        const response = await apiClient.post(
          NAVER_CALLBACK_URL,
          { code, state }
        );

        const { token, new_user, default_nickname, uid } = response.data;
        await AsyncStorage.setItem("accessToken", token);
        
        // uid를 AsyncStorage에 저장 (있는 경우)
        if (uid) {
          await AsyncStorage.setItem("uid", String(uid));
        }
        
        if (new_user) {
          navigation.navigate("Join", { default_nickname, uid });
        } else {
          navigation.navigate("Home");
        }
      } catch (err) {
        console.error("네이버 로그인 처리 실패: ", err);
        Alert.alert("로그인 오류", "네이버 로그인 중 문제가 발생했습니다.");
        navigation.navigate("Login");
      }
    };

    sendCodeToBackend();
  }, [route.params, navigation]);

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

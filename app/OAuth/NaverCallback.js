import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        const response = await axios.post(
          "API명세 후 수정",
          { code, state },
          { headers: { "Content-Type": "application/json" } }
        );

        const { token } = response.data;
        await AsyncStorage.setItem("accessToken", token);
        navigation.navigate("Join");
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

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { palette, typography } from "@styles/globalStyles";
import BottomNavigationBar from "@components/BottomNavigationBar";
import HealthDataDisplay from "./components/HealthDataDisplay";

export default function Home() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>홈 화면</Text>
        <Text style={styles.subtitle}>
          러닝 데이터를 연동해 맞춤 피드백을 표시할 영역입니다.
        </Text>
        <HealthDataDisplay />
      </View>
      <BottomNavigationBar navigation={navigation} currentRoute={route.name} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.black,
  },
  container: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.white,
    marginBottom: 12,
    ...typography.bold,
  },
  subtitle: {
    fontSize: 16,
    color: palette.grayLight,
    lineHeight: 24,
    marginBottom: 24,
  },
});

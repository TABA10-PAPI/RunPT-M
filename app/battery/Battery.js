import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomNavigationBar from "../../components/BottomNavigationBar";

export default function Battery() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>배터리 화면</Text>
        <Text style={styles.subtitle}>
          배터리 관련 기능을 표시할 영역입니다.
        </Text>
      </View>
      <BottomNavigationBar navigation={navigation} currentRoute={route.name} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090909",
  },
  container: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#B5B5B5",
    lineHeight: 24,
  },
});


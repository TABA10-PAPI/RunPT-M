import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";
import apiClient from "@config/api";
import { palette } from "@styles/globalStyles";

export default function Run() {
  const navigation = useNavigation();
  const route = useRoute();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // const user_id = await AsyncStorage.getItem("uid");
      const user_id = 12;
      
      if (!user_id) {
        Alert.alert("오류", "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      // 오늘 날짜를 YYYY-MM-DD 형식으로 생성
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      //const date = `${year}-${month}-${day}`;
      const date = "2025-11-21";

      const data = {
        user_id: parseInt(user_id, 10),
        date: date,
      };

      const response = await apiClient.post("/running", data);

      if (response.data.code === "SU" && response.data.recommendations) {
        // API 응답을 UI 형식에 맞게 변환
        const transformedRecommendations = response.data.recommendations.map((rec, index) => {
          const distance = parseFloat(rec.distance_km);
          const [minutes, seconds] = rec.target_pace.split(":").map(Number);
          const pacePerKm = minutes + seconds / 60; // 분/킬로미터로 변환
          const estimatedTime = Math.round(distance * pacePerKm); // 예상 시간 (분)

          return {
            id: index + 1,
            title: rec.type || "러닝 추천",
            description: rec.reason || "",
            badge: rec.type || "러닝 추천",
            badgeColor: index === 0 ? "#F5F5A0" : "#A0A0A0",
            distance: distance > 0 ? `${distance}KM` : "0KM",
            time: distance > 0 ? `${estimatedTime}Min` : "0Min",
            pace: distance > 0 ? `${minutes}'${String(seconds).padStart(2, "0")}\"/KM` : "----/KM",
            accent: index === 0,
          };
        });

        setRecommendations(transformedRecommendations);
      } else {
        throw new Error(response.data.message || "추천 데이터를 가져올 수 없습니다.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "러닝 추천을 불러오는데 실패했습니다.";
      setError(errorMessage);
      Alert.alert("오류", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <ScreenHeader title="Running PT" />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DAFD2E" />
            <Text style={styles.loadingText}>러닝 추천을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {recommendations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>추천 데이터가 없습니다.</Text>
              </View>
            ) : (
              recommendations.map((rec) => (
                <View
                  key={rec.id}
                  style={[
                    styles.recommendationCard,
                    rec.accent && styles.recommendationCardAccent,
                  ]}
                >
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: rec.badgeColor },
                  ]}
                >
                  <Text style={styles.badgeText}>{rec.badge}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.cardTitle,
                  rec.accent && styles.cardTitleDark,
                ]}
              >
                {rec.title}
              </Text>

              <Text
                style={[
                  styles.cardDescription,
                  rec.accent && styles.cardDescriptionDark,
                ]}
              >
                {rec.description}
              </Text>

              <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricLabel,
                      rec.accent && styles.metricLabelDark,
                    ]}
                  >
                    거리
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      rec.accent && styles.metricValueDark,
                    ]}
                  >
                    {rec.distance}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricLabel,
                      rec.accent && styles.metricLabelDark,
                    ]}
                  >
                    시간
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      rec.accent && styles.metricValueDark,
                    ]}
                  >
                    {rec.time}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricLabel,
                      rec.accent && styles.metricLabelDark,
                    ]}
                  >
                    페이스
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      rec.accent && styles.metricValueDark,
                    ]}
                  >
                    {rec.pace}
                  </Text>
                </View>
                </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
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
  wrapper: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: 16,
    paddingBottom: 90,
  },
  scroll: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 16,
  },
  recommendationCard: {
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 20,
    paddingTop: 12,
    position: "relative",
    gap: 6,
  },
  recommendationCardAccent: {
    backgroundColor: palette.green,
  },
  badgeContainer: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.black,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.white,
    marginTop: 4,
  },
  cardTitleDark: {
    color: palette.black,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.graySubtitle,
  },
  cardDescriptionDark: {
    color: palette.black,
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 20,
  },
  metricItem: {
    gap: 4,
    alignItems: "center",
    
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.white,
  },
  metricLabelDark: {
    color: palette.black,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.white,
  },
  metricValueDark: {
    color: palette.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    gap: 16,
  },
  loadingText: {
    color: palette.white,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 20,
  },
  errorText: {
    color: palette.red,
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: palette.graySubtitle,
    fontSize: 16,
    textAlign: "center",
  },
});

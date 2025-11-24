import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { palette, typography } from "@styles/globalStyles";
import BottomNavigationBar from "@components/BottomNavigationBar";
import { Ionicons } from "@expo/vector-icons";

// Rank badges
const silverMedal = require("@assets/rank/Silver I.png");

// Arrow icons
const arrowLeft = require("@assets/community/arrow_left.png");

export default function Home() {
  const navigation = useNavigation();
  const route = useRoute();

  // Mock data
  const userInfo = {
    name: "홍길동",
    nickname: "달리는 뉴비",
  };

  // TODO: replace with value fetched from backend (0~100)
  const batteryFromServer = 70;

  const batteryLevel = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, batteryFromServer));
    return Math.round(clamped);
  }, [batteryFromServer]);

  const weeklyData = [
    { day: "Sun", date: 23, completed: true, distance: "10.0KM" },
    { day: "Mon", date: 24, completed: true, distance: "5.6KM" },
    { day: "Tue", date: 25, completed: true, distance: "5.4KM" },
    { day: "Wen", date: 26, completed: false, distance: null },
    { day: "Thu", date: 27, completed: true, distance: "5.0KM" },
    { day: "Fri", date: 28, completed: false, distance: null },
    { day: "Sat", date: 29, completed: false, distance: null },
  ];

  const completedDays = weeklyData.filter((day) => day.completed).length;

  // First recommendation card (same as Run.js first card)
  const firstRecommendation = {
    title: "오늘은 회복 러닝!",
    description:
      "어제 10km 러닝으로 피로도가 누적되어 있습니다. 오늘은 회복 러닝을 추천드려요.",
    distance: "3KM",
    time: "20Min",
    pace: "6'30\"/KM",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder} />
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{userInfo.name}</Text>
              <Text style={styles.profileNickname}>{userInfo.nickname}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={palette.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* First Recommendation Card */}
          <View style={styles.recommendationCard}>
            <View style={styles.flameIconContainer}>
              <Ionicons name="flame" size={24} color={palette.black} />
            </View>
            <Text style={styles.recommendationTitle}>
              {firstRecommendation.title}
            </Text>
            <Text style={styles.recommendationDescription}>
              {firstRecommendation.description}
            </Text>
            <View style={styles.recommendationMetrics}>
              <View style={styles.recommendationMetricItem}>
                <Text style={styles.recommendationMetricLabel}>거리</Text>
                <Text style={styles.recommendationMetricValue}>
                  {firstRecommendation.distance}
                </Text>
              </View>
              <View style={styles.recommendationMetricItem}>
                <Text style={styles.recommendationMetricLabel}>시간</Text>
                <Text style={styles.recommendationMetricValue}>
                  {firstRecommendation.time}
                </Text>
              </View>
              <View style={styles.recommendationMetricItem}>
                <Text style={styles.recommendationMetricLabel}>페이스</Text>
                <Text style={styles.recommendationMetricValue}>
                  {firstRecommendation.pace}
                </Text>
              </View>
            </View>
          </View>

          {/* Running Battery and My Level Row */}
          <View style={styles.twoColumnContainer}>
            {/* Running Battery Card */}
            <View style={styles.batteryCard}>
              <Text style={styles.batteryCardTitle}>Running Battery</Text>
              <View style={styles.batteryContainer}>
                <View style={styles.batteryOutline}>
                  <View
                    style={[
                      styles.batteryFill,
                      { width: `${batteryLevel}%` },
                    ]}
                  />
                  <Text style={styles.batteryLabel}>{batteryLevel}%</Text>
                </View>
                <View style={styles.batteryCap} />
              </View>
            </View>

            {/* My Level Card */}
            <View style={styles.levelCard}>
              <Text style={styles.levelCardTitle}>My Level</Text>
              <View style={styles.levelMedalContainer}>
                <Image
                  source={silverMedal}
                  style={styles.levelMedal}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Condition Comment Card */}
          <View style={styles.commentCard}>
            <Text style={styles.commentTitle}>Condition Comment</Text>
            <Text style={styles.commentText}>
              어제 10km 러닝으로 피로도가 누적되어 있습니다. 더운 날씨에 높은
              칼로리를 소모하였으므로 오늘 하루는 수분 섭취에 신경써주세요..
            </Text>
          </View>

          {/* My Running History Section */}
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>My Running History</Text>

            {/* This Week Section */}
            <View style={styles.weekSection}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>This Week</Text>
                <Text style={styles.weekProgress}>
                  {completedDays}/7 Days
                </Text>
              </View>

              <View style={styles.weekDaysContainer}>
                {weeklyData.map((day, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dayItem,
                      day.completed && styles.dayItemCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayDate,
                        day.completed && styles.dayDateCompleted,
                      ]}
                    >
                      {day.date}
                    </Text>
                    <Text
                      style={[
                        styles.dayName,
                        day.completed && styles.dayNameCompleted,
                      ]}
                    >
                      {day.day}
                    </Text>
                    <Text
                      style={[
                        styles.checkmark,
                        day.completed && styles.checkmarkCompleted,
                      ]}
                    >
                      ✓
                    </Text>
                    {day.completed && day.distance && (
                      <Text style={styles.dayDistance}>{day.distance}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
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
    paddingTop: 20,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: palette.gray,
    borderRadius: 25,
  },
  profileTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.white,
  },
  profileNickname: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 16,
  },
  recommendationCard: {
    backgroundColor: palette.green,
    borderRadius: 20,
    padding: 16,
    position: "relative",
    gap: 6,
  },
  flameIconContainer: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.black,
  },
  recommendationDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.black,
  },
  recommendationMetrics: {
    flexDirection: "row",
    marginleft: 20,
    marginRight: 20,
    marginTop: 4,
    paddingLeft: 20,
    justifyContent: "space-between",
  },
  recommendationMetricItem: {
    gap: 4,
    alignItems: "center",
  },
  recommendationMetricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.black,
  },
  recommendationMetricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.black,
  },
  twoColumnContainer: {
    flexDirection: "row",
    gap: 12,
  },
  batteryCard: {
    flex: 1,
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 16,
    paddingTop: 12,
    gap: 12,
  },
  batteryCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  batteryOutline: {
    flex: 1,
    height: 80,
    borderWidth: 3,
    borderColor: palette.white,
    borderRadius: 16,
    padding: 8,
    justifyContent: "center",
    position: "relative",
  },
  batteryFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: palette.green,
  },
  batteryLabel: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "700",
    color: palette.black,
  },
  batteryCap: {
    width: 12,
    height: 32,
    borderRadius: 8,
    backgroundColor: palette.white,
  },
  levelCard: {
    flex: 1,
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 16,
    paddingTop: 12,
    gap: 12,
  },
  levelCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
  },
  levelMedalContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  levelMedal: {
    width: 60,
    height: 60,
  },
  commentCard: {
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.white,
  },
  commentText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#CFCFCF",
  },
  historyCard: {
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 16,
    paddingTop: 12,
    gap: 6,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.green,
  },
  weekSection: {
    gap: 12,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: palette.white,
  },
  weekProgress: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  dayItem: {
    flex: 1,
    backgroundColor: palette.gray,
    borderRadius: 16,
    padding: 6,
    alignItems: "center",
    gap: 0,
    minHeight: 40,
    maxHeight: 90,
  },
  dayItemCompleted: {
    backgroundColor: palette.green,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
  },
  dayDateCompleted: {
    color: palette.black,
  },
  dayName: {
    fontSize: 12,
    color: palette.graySubtitle,
  },
  dayNameCompleted: {
    color: palette.black,
  },
  checkmark: {
    fontSize: 12,
    color: palette.grayPlaceholder,
    marginTop: 0,
  },
  checkmarkCompleted: {
    color: palette.black,
    fontSize: 12,
  },
  dayDistance: {
    fontSize: 10,
    fontWeight: "600",
    color: palette.black,
    marginBottom: 2,
  },
});

import React from "react";
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
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";
import { palette } from "@styles/globalStyles";

// Rank badges
const silverMedal = require("@assets/rank/Silver I.png");
const bronzeMedal2 = require("@assets/rank/Bronze II.png");
const bronzeMedal3 = require("@assets/rank/Bronze III.png");

// Arrow icons
const arrowLeft = require("@assets/community/arrow_left.png");

export default function Mypage() {
  const navigation = useNavigation();
  const route = useRoute();

  // Mock data
  const userInfo = {
    name: "홍길동",
    nickname: "달리는 뉴비",
    height: "175cm",
    weight: "75kg",
    gender: "남",
    age: "20대",
  };

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

  const runningHistory = [
    {
      date: "2025 11 27 Thu",
      distance: "3KM",
      time: "20M",
      pace: "6'30\"/KM",
    },
    {
      date: "2025 11 25 Tue",
      distance: "3KM",
      time: "20M",
      pace: "6'30\"/KM",
    },
    {
      date: "2025 11 24 Mon",
      distance: "3KM",
      time: "20M",
      pace: "6'30\"/KM",
    },
    {
      date: "2025 11 23 Sun",
      distance: "3KM",
      time: "20M",
      pace: "6'30\"/KM",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <ScreenHeader title="My Page" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              {/* TODO: 실제 프로필 이미지로 교체 필요 */}
              <View style={styles.profileImagePlaceholder} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userInfo.name}</Text>
              <Text style={styles.profileNickname}>{userInfo.nickname}</Text>
            </View>
          </View>

          {/* My Level Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My level</Text>
            <View style={styles.levelContainer}>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>3KM</Text>
                <Image
                  source={silverMedal}
                  style={styles.medal}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>5KM</Text>
                <Image
                  source={bronzeMedal2}
                  style={styles.medal}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>10KM</Text>
                <Image
                  source={bronzeMedal3}
                  style={styles.medal}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>21KM</Text>
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>42KM</Text>
              </View>
            </View>
          </View>

          {/* Body Info Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Body Info</Text>
            <View style={styles.bodyInfoContainer}>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>키</Text>
                <Text style={styles.bodyInfoValue}>{userInfo.height}</Text>
              </View>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>체중</Text>
                <Text style={styles.bodyInfoValue}>{userInfo.weight}</Text>
              </View>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>성별</Text>
                <Text style={styles.bodyInfoValue}>{userInfo.gender}</Text>
              </View>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>나이</Text>
                <Text style={styles.bodyInfoValue}>{userInfo.age}</Text>
              </View>
            </View>
          </View>

          {/* My Running History Section */}
          <View style={styles.card}>
            <Text style={styles.historyTitle}>My Running History</Text>

            {/* This Week Section */}
            <View style={styles.weekSection}>
              <View style={styles.weekHeader}>
                <TouchableOpacity>
                  <Image
                    source={arrowLeft}
                    style={styles.arrowIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.weekTitle}>This Week</Text>
                <TouchableOpacity>
                  <Image
                    source={arrowLeft}
                    style={[styles.arrowIcon, styles.arrowRight]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
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

          {/* Running History List - Separate Cards */}
          {runningHistory.map((record, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.historyDate}>{record.date}</Text>
              <View style={styles.historyMetrics}>
                <View style={styles.historyMetricItem}>
                  <Text style={styles.historyMetricLabel}>거리 </Text>
                  <Text style={styles.historyMetricValue}>{record.distance}</Text>
                </View>
                <View style={styles.historyMetricItem}>
                  <Text style={styles.historyMetricLabel}>시간 </Text>
                  <Text style={styles.historyMetricValue}>{record.time}</Text>
                </View>
                <View style={styles.historyMetricItem}>
                  <Text style={styles.historyMetricLabel}>페이스 </Text>
                  <Text style={styles.historyMetricValue}>{record.pace}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 30,
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.white,
  },
  profileNickname: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
  card: {
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.green,
  },
  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  levelItem: {
    alignItems: "center",
    gap: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
  },
  medal: {
    width: 40,
    height: 40,
  },
  bodyInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    
    gap: 16,
  },
  bodyInfoItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  bodyInfoLabel: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
  bodyInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.green,
  },
  weekSection: {
    gap: 12,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: palette.white,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: palette.white,
  },
  arrowRight: {
    transform: [{ rotate: "180deg" }],
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
  historyCard: {
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.green,
  },
  historyMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyMetricItem: {
    flexDirection: "row",
    gap: 6,
  },
  historyMetricLabel: {
    fontSize: 14,
    color: palette.green,
    fontWeight: "600",
  },
  historyMetricValue: {
    fontSize: 14,
    color: palette.white,
  },
});

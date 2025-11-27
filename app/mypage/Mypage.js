import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";
import { palette } from "@styles/globalStyles";
import apiClient from "@config/api";

// Rank badges
const silverMedal = require("@assets/rank/Silver I.png");
const bronzeMedal1 = require("@assets/rank/Bronze I.png");
const bronzeMedal2 = require("@assets/rank/Bronze II.png");
const bronzeMedal3 = require("@assets/rank/Bronze III.png");
const goldMedal1 = require("@assets/rank/Gold I.png");
const goldMedal2 = require("@assets/rank/Gold II.png");
const goldMedal3 = require("@assets/rank/Gold III.png");
const platinumMedal1 = require("@assets/rank/Platinum I.png");
const platinumMedal2 = require("@assets/rank/Platinum II.png");
const platinumMedal3 = require("@assets/rank/Platinum III.png");
const diamondMedal = require("@assets/rank/Diamond.png");
const masterMedal = require("@assets/rank/Master.png");
const challengerMedal = require("@assets/rank/Challenger.png");

// Arrow icons
const arrowLeft = require("@assets/community/arrow_left.png");

// Tier 뱃지 매핑 함수
const getTierBadge = (tierRank) => {
  if (!tierRank) return null;
  
  const tierMap = {
    "BRONZE I": bronzeMedal1,
    "BRONZE II": bronzeMedal2,
    "BRONZE III": bronzeMedal3,
    "SILVER I": silverMedal,
    "SILVER II": silverMedal,
    "SILVER III": silverMedal,
    "GOLD I": goldMedal1,
    "GOLD II": goldMedal2,
    "GOLD III": goldMedal3,
    "PLATINUM I": platinumMedal1,
    "PLATINUM II": platinumMedal2,
    "PLATINUM III": platinumMedal3,
    "DIAMOND": diamondMedal,
    "MASTER": masterMedal,
    "CHALLENGER": challengerMedal,
  };
  
  return tierMap[tierRank] || null;
};

// 시간 변환 함수 (초 -> 분:초)
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}M`;
};

// 페이스 변환 함수 (초 -> 분'초"/KM)
const formatPace = (paceSeconds) => {
  const mins = Math.floor(paceSeconds / 60);
  const secs = paceSeconds % 60;
  return `${mins}'${secs.toString().padStart(2, "0")}"/KM`;
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const dayName = days[date.getDay()];
  
  return `${year} ${month} ${day} ${dayName}`;
};

export default function Mypage() {
  const navigation = useNavigation();
  const route = useRoute();

  const [userInfo, setUserInfo] = useState(null);
  const [tierInfo, setTierInfo] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMypageData();
  }, []);

  const fetchMypageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const uid = await AsyncStorage.getItem("uid");
      
      if (!uid) {
        Alert.alert("오류", "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      console.log("📤 마이페이지 API 요청 시작");
      console.log("요청 URL:", "http://52.78.76.223:8080/user/mypage");
      console.log("요청 데이터:", { uid: parseInt(uid, 10) });
      
      const response = await apiClient.post("/user/mypage", {
        uid: parseInt(uid, 10)
      });

      console.log("✅ 마이페이지 API 응답 성공");
      console.log("응답 데이터:", response.data);

      if (response.data.code === "SU") {
        setUserInfo(response.data.user);
        setTierInfo(response.data.tier);
        setRecentRecords(response.data.recentRecords || []);
      } else {
        throw new Error(response.data.message || "데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("마이페이지 데이터 로딩 실패: ", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
      Alert.alert("오류", "마이페이지 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 성별 변환 함수
  const formatGender = (gender) => {
    return gender === "MALE" ? "남" : gender === "FEMALE" ? "여" : gender;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.wrapper}>
          <ScreenHeader title="My Page" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.green} />
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        </View>
        <BottomNavigationBar navigation={navigation} currentRoute={route.name} />
      </SafeAreaView>
    );
  }

  if (error || !userInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.wrapper}>
          <ScreenHeader title="My Page" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || "데이터를 불러올 수 없습니다."}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchMypageData}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNavigationBar navigation={navigation} currentRoute={route.name} />
      </SafeAreaView>
    );
  }

  // Tier 뱃지 가져오기
  const shortTierBadge = tierInfo?.shortTierRank ? getTierBadge(tierInfo.shortTierRank) : null;
  const longTierBadge = tierInfo?.longTierRank ? getTierBadge(tierInfo.longTierRank) : null;

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
              <Text style={styles.profileName}>{userInfo.nickname}</Text>
            </View>
          </View>

          {/* My Level Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My level</Text>
            <View style={styles.levelContainer}>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>3KM</Text>
                {shortTierBadge ? (
                  <Image
                    source={shortTierBadge}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>5KM</Text>
                {longTierBadge ? (
                  <Image
                    source={longTierBadge}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>10KM</Text>
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
                <Text style={styles.bodyInfoValue}>{userInfo.height}cm</Text>
              </View>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>체중</Text>
                <Text style={styles.bodyInfoValue}>{userInfo.weight}kg</Text>
              </View>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>성별</Text>
                <Text style={styles.bodyInfoValue}>{formatGender(userInfo.gender)}</Text>
              </View>
              <View style={styles.bodyInfoItem}>
                <Text style={styles.bodyInfoLabel}>나이</Text>
                <Text style={styles.bodyInfoValue}>{userInfo.age}세</Text>
              </View>
            </View>
          </View>

          {/* My Running History Section */}
          <View style={styles.card}>
            <Text style={styles.historyTitle}>My Running History</Text>
          </View>

          {/* Running History List - Separate Cards */}
          {recentRecords.length > 0 ? (
            recentRecords.map((record) => (
              <View key={record.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                <View style={styles.historyMetrics}>
                  <View style={styles.historyMetricItem}>
                    <Text style={styles.historyMetricLabel}>거리 </Text>
                    <Text style={styles.historyMetricValue}>{record.distance.toFixed(1)}KM</Text>
                  </View>
                  <View style={styles.historyMetricItem}>
                    <Text style={styles.historyMetricLabel}>시간 </Text>
                    <Text style={styles.historyMetricValue}>{formatDuration(record.durationSec)}</Text>
                  </View>
                  <View style={styles.historyMetricItem}>
                    <Text style={styles.historyMetricLabel}>페이스 </Text>
                    <Text style={styles.historyMetricValue}>{formatPace(record.pace)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>기록이 없습니다.</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: palette.graySubtitle,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: palette.graySubtitle,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: palette.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.black,
  },
  medalPlaceholder: {
    width: 40,
    height: 40,
  },
  emptyContainer: {
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
});

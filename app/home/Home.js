import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { palette, typography } from "@styles/globalStyles";
import BottomNavigationBar from "@components/BottomNavigationBar";
import { getProfileImage } from "@utils/profileImage";
import { Ionicons } from "@expo/vector-icons";
import readRunningData from "@services/HealthConnectService";
import apiClient from "@config/api";
import { useUid } from "@hooks/UseUid";

// Rank badges
const rankBadges = {
  bronze: require("@assets/rank/Bronze III.png"),
  silver: require("@assets/rank/Silver III.png"),
  gold: require("@assets/rank/Gold III.png"),
  platinum: require("@assets/rank/Platinum III.png"),
  diamond: require("@assets/rank/Diamond.png"),
  master: require("@assets/rank/Master.png"),
  challenger: require("@assets/rank/Challenger.png"),
};

// tier 문자열을 파싱하여 적절한 뱃지 이미지를 반환
const getTierBadge = (tier) => {
  if (!tier) return rankBadges.silver; // 기본값
  
  const tierLower = tier.toLowerCase();
  
  // "gold", "silver" 같은 단순 형식
  if (tierLower === "diamond") return rankBadges.diamond;
  if (tierLower === "master") return rankBadges.master;
  if (tierLower === "challenger") return rankBadges.challenger;
  
  // "gold", "silver", "bronze", "platinum" 같은 경우
  // 기본적으로 I 등급으로 설정 (실제로는 API 응답에 따라 다를 수 있음)
  if (tierLower.includes("bronze")) {
    return rankBadges.bronze;
  }
  if (tierLower.includes("silver")) {
    return rankBadges.silver;
  }
  if (tierLower.includes("gold")) {
    return rankBadges.gold;
  }
  if (tierLower.includes("platinum")) {
    return rankBadges.platinum;
  }
  
  // 기본값
  return rankBadges.silver;
};

export default function Home() {
  const navigation = useNavigation();
  const route = useRoute();
  //const { uid, isLoading: uidLoading } = useUid();
  // const uid = 12;
  // const uidLoading = false;

  // API 응답 데이터 상태
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 호출 함수
  useEffect(() => {
    const fetchHomeData = async () => {
      if (uidLoading || !uid) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // 오늘 날짜를 YYYY-MM-DD 형식으로 변환
        const today = new Date().toISOString().split('T')[0];
        // const today = '2025-11-21';

        // API 요청
        const response = await apiClient.post('/home', {
          uid: parseInt(uid),
          date: today,
        });

        if (response.data.code === 'SU') {
          setHomeData(response.data);
        } else {
          setError(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Home API Error:', err);
        setError(err?.response?.data?.message || '서버 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [uid, uidLoading]);

  // Home 화면이 포커스될 때 HealthConnectService 실행
  useEffect(() => {
    const runHealthConnect = async () => {
      try {
        await readRunningData();
      } catch (error) {
        // 에러는 조용히 처리 (서비스 내부에서 이미 처리됨)
      }
    };
    
    // 화면 렌더링 후 약간의 지연을 두고 실행
    const timer = setTimeout(() => {
      runHealthConnect();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // API 데이터 사용
  const userInfo = {
    nickname: homeData?.nickname,
  };

  // API에서 받은 battery 값
  const batteryFromServer = homeData?.battery?.battery;

  const batteryLevel = useMemo(() => {
    if (batteryFromServer == null) return null;
    const clamped = Math.max(0, Math.min(100, batteryFromServer));
    return Math.round(clamped);
  }, [batteryFromServer]);

  // tier에서 가장 높은 등급 찾기
  const highestTier = useMemo(() => {
    if (!homeData?.tier) return null;
    
    const tierOrder = {
      'BRONZE': 1,
      'SILVER': 2,
      'GOLD': 3,
      'PLATINUM': 4,
      'DIAMOND': 5,
      'MASTER': 6,
      'CHALLENGER': 7,
    };
    
    const tiers = [
      homeData.tier.km3,
      homeData.tier.km5,
      homeData.tier.km10,
      homeData.tier.half,
      homeData.tier.full,
    ].filter(Boolean);
    
    if (tiers.length === 0) return null;
    
    // 가장 높은 등급 찾기
    const highest = tiers.reduce((max, tier) => {
      const maxOrder = tierOrder[max?.toUpperCase()] || 0;
      const currentOrder = tierOrder[tier?.toUpperCase()] || 0;
      return currentOrder > maxOrder ? tier : max;
    });
    
    return highest;
  }, [homeData?.tier]);

  // 페이스 문자열을 분으로 변환 (예: "5:32" -> 5.533분)
  const parsePaceToMinutes = (paceString) => {
    if (!paceString) return null;
    const parts = paceString.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes + seconds / 60;
  };

  // API에서 받은 recommendation 데이터
  const firstRecommendation = useMemo(() => {
    if (homeData?.battery?.recommendationsJson) {
      try {
        const recommendations = JSON.parse(homeData.battery.recommendationsJson);
        if (recommendations && recommendations.length > 0) {
          const first = recommendations[0];
          const distanceKm = first.distance_km;
          const paceMinutes = parsePaceToMinutes(first.target_pace);
          
          // 시간 계산: 거리(km) * 페이스(분/km) = 시간(분)
          let timeString = "";
          if (distanceKm && paceMinutes) {
            const totalMinutes = distanceKm * paceMinutes;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.round(totalMinutes % 60);
            if (hours > 0) {
              timeString = `${hours}H ${minutes}M`;
            } else {
              timeString = `${minutes}M`;
            }
          }
          
          return {
            title: `${first.type}`,
            description: first.reason || "",
            distance: `${first.distance_km}KM`,
            pace: `${first.target_pace}/KM`,
            time: timeString,
          };
        }
      } catch (e) {
        console.error('Failed to parse recommendationsJson:', e);
      }
    }
    return null;
  }, [homeData?.battery?.recommendationsJson]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <Image
                source={getProfileImage(uid)}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.profileTextContainer}>
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
          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.green} />
              <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Content - Show only when not loading and no error */}
          {!isLoading && !error && (
            <>
          {/* First Recommendation Card */}
          {firstRecommendation && (
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
                {firstRecommendation.time && (
                  <View style={styles.recommendationMetricItem}>
                    <Text style={styles.recommendationMetricLabel}>시간</Text>
                    <Text style={styles.recommendationMetricValue}>
                      {firstRecommendation.time}
                    </Text>
                  </View>
                )}
                <View style={styles.recommendationMetricItem}>
                  <Text style={styles.recommendationMetricLabel}>페이스</Text>
                  <Text style={styles.recommendationMetricValue}>
                    {firstRecommendation.pace}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Running Battery and My Level Row */}
          {(batteryLevel != null || highestTier) && (
            <View style={styles.twoColumnContainer}>
              {/* Running Battery Card */}
              {batteryLevel != null && (
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
              )}

              {/* My Level Card */}
              {highestTier && (
                <View style={styles.levelCard}>
                  <Text style={styles.levelCardTitle}>My Level</Text>
                  <View style={styles.levelMedalContainer}>
                    <Image
                      source={getTierBadge(highestTier)}
                      style={styles.levelMedal}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Condition Comment Card */}
          {(homeData?.battery?.feedback || homeData?.battery?.reason) && (
            <View style={styles.commentCard}>
              <Text style={styles.commentTitle}>Condition Comment</Text>
              <Text style={styles.commentText}>
                {homeData?.battery?.feedback && `${homeData.battery.feedback}\n`}
                {homeData?.battery?.reason}
              </Text>
            </View>
          )}

          {/* My Running History Section */}
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>This Week Running</Text>

            {/* This Week Section */}
            <View style={styles.weekSection}>
              {/* <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>This Week</Text>
              </View> */}

              <View style={styles.weekDaysContainer}>
                {(() => {
                  // 주간 데이터 계산 (Mypage.js 로직 참고)
                  const getWeekStart = (date) => {
                    const d = new Date(date);
                    const day = d.getDay();
                    const diff = d.getDate() - day;
                    return new Date(d.setDate(diff));
                  };

                  const formatDateString = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                  };

                  const parseDateString = (dateString) => {
                    if (dateString.includes("T")) {
                      return new Date(dateString);
                    }
                    return new Date(dateString + "T00:00:00");
                  };

                  const getWeekDays = (weekStart) => {
                    const days = [];
                    for (let i = 0; i < 7; i++) {
                      const date = new Date(weekStart);
                      date.setDate(date.getDate() + i);
                      days.push(date);
                    }
                    return days;
                  };

                  const currentWeekStart = getWeekStart(new Date());
                  const weekDays = getWeekDays(currentWeekStart);
                  const runningSessions = homeData?.runningSession || [];

                  return weekDays.map((day, index) => {
                    const dateStr = formatDateString(day);
                    const dayRecords = runningSessions.filter((record) => {
                      const recordDate = formatDateString(parseDateString(record.date));
                      return recordDate === dateStr;
                    });
                    
                    const totalDistance = dayRecords.reduce((sum, r) => sum + (r.distance / 1000), 0);
                    const hasRecord = dayRecords.length > 0;
                    
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const dayName = days[day.getDay()];
                    const dayNumber = day.getDate();
                    
                    return (
                      <View
                        key={index}
                        style={[
                          styles.dayItem,
                          hasRecord && styles.dayItemCompleted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayDate,
                            hasRecord && styles.dayDateCompleted,
                          ]}
                        >
                          {dayNumber}
                        </Text>
                        <Text
                          style={[
                            styles.dayName,
                            hasRecord && styles.dayNameCompleted,
                          ]}
                        >
                          {dayName}
                        </Text>
                        <Text
                          style={[
                            styles.checkmark,
                            hasRecord && styles.checkmarkCompleted,
                          ]}
                        >
                          ✓
                        </Text>
                        {hasRecord && totalDistance > 0 && (
                          <Text style={styles.dayDistance}>
                            {totalDistance.toFixed(1)}KM
                          </Text>
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
            </View>
          </View>
            </>
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
  profileImage: {
    width: "100%",
    height: "100%",
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
    fontSize: 13,
    fontWeight: "700",
    color: palette.black,
  },
  recommendationMetricValue: {
    fontSize: 14,
    fontWeight: "650",
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
    gap: 0,
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
    width: 10,
    height: 40,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
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
    fontWeight: "600",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: palette.gray,
    borderRadius: 20,
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
  },
  sessionItem: {
    padding: 12,
    marginTop: 8,
    backgroundColor: palette.gray,
    borderRadius: 12,
    gap: 4,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
  },
  sessionInfo: {
    fontSize: 12,
    color: palette.graySubtitle,
  },
});

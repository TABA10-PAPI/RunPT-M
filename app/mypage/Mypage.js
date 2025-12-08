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
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";
import { palette } from "@styles/globalStyles";
import apiClient from "@config/api";
import { getProfileImage } from "@utils/profileImage";
import { useUid } from "@hooks/UseUid";
// Rank badges
const silverMedal = require("@assets/rank/Silver III.png");
const bronzeMedal = require("@assets/rank/Bronze III.png");
const goldMedal = require("@assets/rank/Gold III.png");
const platinumMedal = require("@assets/rank/Platinum III.png");
const diamondMedal = require("@assets/rank/Diamond.png");
const masterMedal = require("@assets/rank/Master.png");
const challengerMedal = require("@assets/rank/Challenger.png");

// Tier 뱃지 매핑 함수
const getTierBadge = (tierRank) => {
  if (!tierRank) return null;
  
  const tierMap = {
    "BRONZE": bronzeMedal,
    "SILVER": silverMedal,
    "GOLD": goldMedal,
    "PLATINUM": platinumMedal,
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

// 주의 시작일(일요일) 계산 함수
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // 일요일로 이동
  return new Date(d.setDate(diff));
};

// 주의 끝일(토요일) 계산 함수
const getWeekEnd = (date) => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
};

// 주의 모든 날짜 배열 반환
const getWeekDays = (weekStart) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
};

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 날짜 문자열을 Date 객체로 변환 (ISO 형식 또는 YYYY-MM-DD 형식)
const parseDateString = (dateString) => {
  // ISO 형식인 경우 (2025-12-03T23:29:44)
  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  // YYYY-MM-DD 형식인 경우
  return new Date(dateString + "T00:00:00");
};

// 주차 계산 함수 (목요일 기준)
const getWeekOfMonth = (date) => {
  const d = new Date(date);
  
  // 현재 주의 목요일 찾기 (일요일이 0이므로 목요일은 4)
  const weekStart = getWeekStart(d);
  const thursday = new Date(weekStart);
  thursday.setDate(weekStart.getDate() + 4); // 일요일 + 4일 = 목요일
  
  const year = thursday.getFullYear();
  const month = thursday.getMonth();
  
  // 해당 월의 첫 번째 날
  const firstDay = new Date(year, month, 1);
  
  // 첫 번째 목요일 찾기
  const firstDayOfWeek = firstDay.getDay();
  const firstThursday = new Date(firstDay);
  
  // 목요일은 4 (일요일=0, 월요일=1, ..., 목요일=4)
  if (firstDayOfWeek <= 4) {
    // 첫 번째 날이 목요일 이전이면
    firstThursday.setDate(1 + (4 - firstDayOfWeek));
  } else {
    // 첫 번째 날이 목요일 이후면 다음 주 목요일
    firstThursday.setDate(1 + (7 - firstDayOfWeek + 4));
  }
  
  // 주차 계산 (목요일 간의 차이를 7로 나눔)
  const diffDays = Math.floor((thursday - firstThursday) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  return {
    month: month + 1,
    week: weekNumber,
  };
};


export default function Mypage() {
  const navigation = useNavigation();
  const route = useRoute();

  const [userInfo, setUserInfo] = useState(null);
  const [tierInfo, setTierInfo] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const { uid, isLoading: uidLoading } = useUid();

  useEffect(() => {
    fetchMypageData();
  }, []);

  const fetchMypageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      //const uid = 22;
      
      if (!uid) {
        Alert.alert("오류", "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      const response = await apiClient.post("/user/mypage", {
        uid: parseInt(uid, 10)
      });

      if (response.data.code === "SU") {
        setUserInfo(response.data.user);
        setTierInfo(response.data.tier);
        setRecentRecords(response.data.recentRecords || []);
      } else {
        throw new Error(response.data.message || "데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
      Alert.alert("오류", "마이페이지 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 성별 변환 함수
  const formatGender = (gender) => {
    if (!gender) return gender;
    const genderUpper = gender.toUpperCase();
    if (genderUpper === "M" || genderUpper === "MALE") return "남";
    if (genderUpper === "F" || genderUpper === "FEMALE") return "여";
    return gender;
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

  // Tier 뱃지 가져오기 (거리별)
  const tier3km = tierInfo?.km3 ? getTierBadge(tierInfo.km3) : null;
  const tier5km = tierInfo?.km5 ? getTierBadge(tierInfo.km5) : null;
  const tier10km = tierInfo?.km10 ? getTierBadge(tierInfo.km10) : null;
  const tierHalf = tierInfo?.half ? getTierBadge(tierInfo.half) : null;
  const tierFull = tierInfo?.full ? getTierBadge(tierInfo.full) : null;

  // 주간 데이터 처리
  const weekDays = getWeekDays(currentWeekStart);
  const weekEnd = getWeekEnd(currentWeekStart);
  
  // 주차 계산
  const weekInfo = getWeekOfMonth(currentWeekStart);
  const weekTitleText = `${weekInfo.month}월 ${weekInfo.week}주차`;
  
  // 주간 기록을 날짜별로 그룹화
  const weeklyRecords = weekDays.map((day) => {
    const dateStr = formatDateString(day);
    const dayRecords = recentRecords.filter((record) => {
      const recordDate = formatDateString(parseDateString(record.date));
      return recordDate === dateStr;
    });
    
    // distance는 미터 단위이므로 킬로미터로 변환 (1000으로 나누기)
    const totalDistance = dayRecords.reduce((sum, r) => sum + (r.distance / 1000), 0);
    const hasRecord = dayRecords.length > 0;
    
    return {
      date: day,
      dateStr,
      hasRecord,
      distance: totalDistance,
      records: dayRecords,
    };
  });

  // 해당 주의 모든 상세 기록 (중복 제거)
  const weekRecords = recentRecords.filter((record) => {
    const recordDate = parseDateString(record.date);
    // 날짜만 비교 (시간 제외)
    const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
    const weekStartOnly = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
    const weekEndOnly = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
    return recordDateOnly >= weekStartOnly && recordDateOnly <= weekEndOnly;
  })
  // 중복 제거: 같은 id를 가진 기록은 하나만 남기기
  .filter((record, index, self) => 
    index === self.findIndex((r) => r.id === record.id)
  )
  .sort((a, b) => {
    return parseDateString(b.date) - parseDateString(a.date);
  });

  // 주 이동 함수
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

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
              <Image
                source={getProfileImage(userInfo?.uid)}
                style={styles.profileImage}
                resizeMode="cover"
              />
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
                {tier3km ? (
                  <Image
                    source={tier3km}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>5KM</Text>
                {tier5km ? (
                  <Image
                    source={tier5km}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>10KM</Text>
                {tier10km ? (
                  <Image
                    source={tier10km}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>21KM</Text>
                {tierHalf ? (
                  <Image
                    source={tierHalf}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelText}>42KM</Text>
                {tierFull ? (
                  <Image
                    source={tierFull}
                    style={styles.medal}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.medalPlaceholder} />
                )}
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

            {/* This Week Section */}
            <View style={styles.weekSection}>
              <View style={styles.weekHeader}>
                <TouchableOpacity onPress={goToPreviousWeek}>
                  <Icon name="chevron-left" size={20} color={palette.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToCurrentWeek}>
                  <Text style={styles.weekTitle}>{weekTitleText}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextWeek}>
                  <Icon name="chevron-right" size={20} color={palette.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekDaysContainer}>
                {weeklyRecords.map((dayData, index) => {
                  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const dayName = days[dayData.date.getDay()];
                  const dayNumber = dayData.date.getDate();
                  
                  return (
                    <View
                      key={index}
                      style={[
                        styles.dayItem,
                        dayData.hasRecord && styles.dayItemCompleted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayDate,
                          dayData.hasRecord && styles.dayDateCompleted,
                        ]}
                      >
                        {dayNumber}
                      </Text>
                      <Text
                        style={[
                          styles.dayName,
                          dayData.hasRecord && styles.dayNameCompleted,
                        ]}
                      >
                        {dayName}
                      </Text>
                      <Text
                        style={[
                          styles.checkmark,
                          dayData.hasRecord && styles.checkmarkCompleted,
                        ]}
                      >
                        ✓
                      </Text>
                      {dayData.hasRecord && dayData.distance > 0 && (
                        <Text style={styles.dayDistance}>
                          {dayData.distance.toFixed(1)}KM
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Running History List - Separate Cards */}
          {weekRecords.length > 0 ? (
            weekRecords.map((record) => (
              <View key={record.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                <View style={styles.historyMetrics}>
                  <View style={styles.historyMetricsRow}>
                    <Text style={styles.historyMetricLabel}>거리</Text>
                    <Text style={styles.historyMetricLabel}>시간</Text>
                    <Text style={styles.historyMetricLabel}>페이스</Text>
                    <Text style={styles.historyMetricLabel}>심박수</Text>
                  </View>
                  <View style={styles.historyMetricsRow}>
                    <Text style={styles.historyMetricValue}>{(record.distance / 1000).toFixed(1)}KM</Text>
                    <Text style={styles.historyMetricValue}>{formatDuration(record.durationSec)}</Text>
                    <Text style={styles.historyMetricValue}>{formatPace(record.pace)}</Text>
                    <Text style={styles.historyMetricValue}>
                      {record.heartRateAvg ? `${Math.round(record.heartRateAvg)}bpm` : "-"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>이 주에는 기록이 없습니다.</Text>
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
    paddingTop: 10,
    paddingBottom: 10,
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
    gap: 12,
    marginBottom: 2,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 30,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    gap: 4,
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
  card: {
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
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
    gap: 4,
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
    gap: 16,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: palette.white,
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
    fontWeight: "600",
    color: palette.green,
  },
  historyMetrics: {
    gap: 4,
  },
  historyMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  historyMetricLabel: {
    fontSize: 14,
    color: palette.green,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  historyMetricValue: {
    fontSize: 14,
    color: palette.white,
    flex: 1,
    textAlign: "center",
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

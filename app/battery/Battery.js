import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";
import { palette } from "@styles/globalStyles";
import apiClient from "@config/api";
//import { useUid } from "@hooks/UseUid";

export default function Battery() {
  const navigation = useNavigation();
  const route = useRoute();
  //const { uid, isLoading: uidLoading } = useUid();
  const uid = 12;
  const uidLoading = false;

  const [batteryScore, setBatteryScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 호출
  useEffect(() => {
    const fetchBatteryData = async () => {
      if (uidLoading || !uid) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 날짜 포맷팅 (YYYY-MM-DD)
        //const date = new Date().toISOString().split('T')[0];
        const date = "2025-11-21";
        
        // API 요청
        const response = await apiClient.post("/running/battery", {
          user_id: parseInt(uid, 10),
          date: date,
        });

        if (response.data.code === "SU") {
          setBatteryScore(response.data.battery_score);
        } else {
          throw new Error(response.data.message || "배터리 데이터를 가져오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("[Battery] API 호출 실패:", err);
        setError(err?.message || "배터리 데이터를 불러오는데 실패했습니다.");
        // 에러 발생 시 기본값 설정
        setBatteryScore(70);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatteryData();
  }, [uid, uidLoading]);

  const batteryFromServer = batteryScore !== null ? batteryScore : 70;

  const batteryLevel = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, batteryFromServer));
    return Math.round(clamped);
  }, [batteryFromServer]);

  const statsCards = [
    {
      key: "calories",
      label: "Calories",
      value: "630",
      unit: "kcal",
      span: 2,
      accent: true,
    },
    { key: "heart", label: "Heart rate", value: "86", unit: "bpm" },
    { key: "sleep", label: "Sleep", value: "6.5", unit: "hour" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <ScreenHeader title="Running Battery" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading || uidLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.green} />
            </View>
          ) : (
            <>
              <View style={styles.batteryCard}>
            <View style={styles.batteryContainer}>
              <View style={styles.batteryOutline}>
                <View
                  style={[
                    styles.batteryFill,
                    { width: `${batteryLevel}%` },
                  ]}
                >
                  <Text style={styles.batteryLabel}>{batteryLevel}%</Text>
                </View>
              </View>
              <View style={styles.batteryCap} />
            </View>
          </View>

          <View style={styles.commentCard}>
            <Text style={styles.commentTitle}>AI Comment</Text>
            <Text style={styles.commentText}>
              어제 10km 러닝으로 피로도가 누적되어 있습니다. 더운 날씨에 높은
              칼로리를 소모했으므로 오늘 하루는 수분 섭취에 신경써주세요. 1.5리터
              이상 마시는 것을 권장합니다. 수면시간이 평소보다 조금 부족하여 오늘
              하루의 시작 배터리가 낮습니다. 컨디션 관리에 유의해주세요.
            </Text>
          </View>

          <View style={styles.statsGrid}>
            {statsCards.map(({ key, label, value, unit, span, accent }) => (
              <View
                key={key}
                style={[
                  styles.statCard,
                  span === 2 && styles.statCardWide,
                  accent && styles.statCardAccent,
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    accent && styles.statLabelDark,
                  ]}
                >
                  {label}
                </Text>
                <View style={styles.statValueRow}>
                  <Text
                    style={[
                      styles.statValue,
                      accent && styles.statValueDark,
                    ]}
                  >
                    {value}
                  </Text>
                  <Text
                    style={[
                      styles.statUnit,
                      accent && styles.statUnitDark,
                    ]}
                  >
                    {unit}
                  </Text>
                </View>
              </View>
            ))}
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
    paddingTop: 16,
    paddingBottom: 90,
  },
  scroll: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 20,
  },
  batteryCard: {
    backgroundColor: "transparent",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    width: "100%",
  },
  batteryOutline: {
    flex: 1,
    height: 140,
    borderWidth: 4,
    borderColor: palette.white,
    borderRadius: 28,
    padding: 12,
    justifyContent: "center",
    position: "relative",
  },
  batteryFill: {
    height: "100%",
    borderRadius: 18,
    backgroundColor: palette.green,
  },
  batteryLabel: {
    position: "absolute",
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    fontSize: 30,
    fontWeight: "700",
    color: palette.black,
  },
  batteryCap: {
    width: 20,
    height: 66,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: palette.white,
  },
  commentCard: {
    backgroundColor: palette.gray,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.white,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.graySubtitle,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "47%",
    borderRadius: 18,
    backgroundColor: palette.gray,
    padding: 16,
    gap: 6,
  },
  statCardWide: {
    flexBasis: "100%",
  },
  statCardAccent: {
    backgroundColor: palette.green,
  },
  statLabel: {
    fontSize: 14,
    color: palette.graySubtitle,
  },
  statLabelDark: {
    color: palette.grayDark,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: palette.white,
  },
  statValueDark: {
    color: palette.black,
  },
  statUnit: {
    fontSize: 16,
    color: palette.graySubtitle,
    textTransform: "lowercase",
  },
  statUnitDark: {
    color: palette.grayDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
});

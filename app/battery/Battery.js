import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";
import { palette } from "@styles/globalStyles";
import apiClient from "@config/api";
import { useUid } from "@hooks/UseUid";

export default function Battery() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid, isLoading: uidLoading } = useUid();
  //const uid = 22;
  //const uidLoading = false;

  const [batteryData, setBatteryData] = useState(null);
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
        const date = new Date().toISOString().split('T')[0];
        //const date = "2025-12-04";
        
        // API 요청
        const response = await apiClient.post("/running/battery", {
          user_id: parseInt(uid, 10),
          date: date,
        });

        if (response.data.code === "SU") {
          setBatteryData(response.data);
        } else {
          throw new Error(response.data.message || "배터리 데이터를 가져오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("[Battery] API 호출 실패:", err);
        setError(err?.message || "배터리 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatteryData();
  }, [uid, uidLoading]);

  const batteryLevel = useMemo(() => {
    if (batteryData?.battery_score == null) return null;
    const clamped = Math.max(0, Math.min(100, batteryData.battery_score));
    return Math.round(clamped);
  }, [batteryData?.battery_score]);

  // 배터리 레벨에 따른 색상 결정
  const batteryColor = useMemo(() => {
    if (batteryLevel == null) return palette.green;
    if (batteryLevel <= 15) return palette.red;
    if (batteryLevel <= 30) return palette.yellow;
    return palette.green;
  }, [batteryLevel]);

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
              <ActivityIndicator size="large" color={batteryColor} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              {batteryLevel != null && (
                <View style={styles.batteryCard}>
                  <View style={styles.batteryContainer}>
                    <View style={styles.batteryOutline}>
                      <View
                        style={[
                          styles.batteryFill,
                          { width: `${batteryLevel}%`, backgroundColor: batteryColor },
                        ]}
                      >
                        <Text style={styles.batteryLabel}>{batteryLevel}%</Text>
                      </View>
                    </View>
                    <View style={styles.batteryCap} />
                  </View>
                </View>
              )}

              {(batteryData?.feedback || batteryData?.reason) && (
                <View style={styles.commentCard}>
                  <Text style={[styles.commentTitle, { color: batteryColor }]}>AI Comment</Text>
                  <Text style={styles.commentText}>
                    {batteryData?.feedback && `${batteryData.feedback}\n`}
                    {batteryData?.reason}
                  </Text>
                </View>
              )}
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
    paddingTop: 10,
    paddingBottom: 10,
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
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.graySubtitle,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
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
});

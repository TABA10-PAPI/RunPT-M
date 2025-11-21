import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomNavigationBar from "../../components/BottomNavigationBar";
import ScreenHeader from "../../components/ScreenHeader";

export default function Battery() {
  const navigation = useNavigation();
  const route = useRoute();

  // TODO: replace with value fetched from backend (0~100)
  const batteryFromServer = 70;

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
          <View style={styles.batteryCard}>
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
    gap: 20,
  },
  batteryCard: {
    backgroundColor: "#111111",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  batteryOutline: {
    width: "100%",
    height: 140,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderRadius: 28,
    padding: 12,
    justifyContent: "center",
    position: "relative",
  },
  batteryFill: {
    height: "100%",
    borderRadius: 18,
    backgroundColor: "#DAFD2E",
  },
  batteryLabel: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  batteryCap: {
    width: 18,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  commentCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#CFCFCF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "47%",
    borderRadius: 18,
    backgroundColor: "#1B1B1B",
    padding: 16,
    gap: 6,
  },
  statCardWide: {
    flexBasis: "100%",
  },
  statCardAccent: {
    backgroundColor: "#DAFD2E",
  },
  statLabel: {
    fontSize: 14,
    color: "#CFCFCF",
  },
  statLabelDark: {
    color: "#1A1A1A",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statValueDark: {
    color: "#090909",
  },
  statUnit: {
    fontSize: 16,
    color: "#A0A0A0",
    textTransform: "lowercase",
  },
  statUnitDark: {
    color: "#1A1A1A",
  },
});

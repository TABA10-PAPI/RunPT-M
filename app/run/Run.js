import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomNavigationBar from "@components/BottomNavigationBar";
import ScreenHeader from "@components/ScreenHeader";

export default function Run() {
  const navigation = useNavigation();
  const route = useRoute();

  const recommendations = [
    {
      id: 1,
      title: "오늘은 회복 러닝!",
      description: "어제 10km 러닝으로 피로도가 누적되어 있습니다. 오늘은 회복 러닝을 추천드려요.",
      badge: "Best",
      badgeColor: "#F5F5A0",
      distance: "3KM",
      time: "20Min",
      pace: "6'30\"/KM",
      accent: true,
    },
    {
      id: 2,
      title: "체력 증진을 위해 한걸음 더!",
      description: "어제 10km 러닝으로 피로도가 있는 편이에요. 큰 무리없이 가볍게 뛰는 코스를 추천드려요.",
      badge: "2nd",
      badgeColor: "#A0A0A0",
      distance: "5KM",
      time: "30Min",
      pace: "6'30\"/KM",
      accent: false,
    },
    {
      id: 3,
      title: "오늘 하루는 쉬어가요",
      description: "어제 10km 러닝으로 피로도가 누적되어 있습니다. 오늘 하루는 컨디션 조절을 위해 쉬어가는 것이 좋겠어요.",
      badge: "3rd",
      badgeColor: "#A0A0A0",
      distance: "0KM",
      time: "0Min",
      pace: "----/KM",
      accent: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <ScreenHeader title="Running PT" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {recommendations.map((rec) => (
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
  recommendationCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    padding: 20,
    paddingTop: 12,
    position: "relative",
    gap: 6,
  },
  recommendationCardAccent: {
    backgroundColor: "#DAFD2E",
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
    fontWeight: "700",
    color: "#000000",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  cardTitleDark: {
    color: "#000000",
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#CFCFCF",
  },
  cardDescriptionDark: {
    color: "#1A1A1A",
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
    color: "#A0A0A0",
  },
  metricLabelDark: {
    color: "#1A1A1A",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  metricValueDark: {
    color: "#000000",
  },
});

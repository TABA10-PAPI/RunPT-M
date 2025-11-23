import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { palette, typography } from "@styles/globalStyles";
import HealthConnectService from "@services/HealthConnectService";

export default function HealthDataDisplay() {
  const [isLoading, setIsLoading] = useState(false);
  const [conditionSummary, setConditionSummary] = useState(null);
  const [runningSessions, setRunningSessions] = useState([]);
  const [sleepSessions, setSleepSessions] = useState([]);
  const [oxygenData, setOxygenData] = useState([]);

  // Health Connect 권한 요청 및 데이터 가져오기
  const loadHealthData = async () => {
    try {
      setIsLoading(true);

      // 권한 요청
      try {
        await HealthConnectService.requestPermissions();
      } catch (error) {
        if (error.code === "NEED_USER_ACTION") {
          Alert.alert(
            "권한 필요",
            "Health Connect 권한이 필요합니다. 설정에서 권한을 허용해주세요."
          );
          return;
        }
        console.error("[HealthDataDisplay] 권한 요청 실패:", error);
      }

      // 컨디션 요약 가져오기
      try {
        const summary = await HealthConnectService.getConditionSummary();
        setConditionSummary(summary);
        console.log("[HealthDataDisplay] 컨디션 요약:", summary);
      } catch (error) {
        console.error("[HealthDataDisplay] 컨디션 요약 가져오기 실패:", error);
      }

      // 달리기 세션 가져오기
      try {
        const sessions = await HealthConnectService.getRunningSessions(7);
        setRunningSessions(sessions);
        console.log("[HealthDataDisplay] 달리기 세션:", sessions);
      } catch (error) {
        console.error("[HealthDataDisplay] 달리기 세션 가져오기 실패:", error);
      }

      // 수면 기록 가져오기 (최근 7일)
      try {
        const sleep = await HealthConnectService.getSleepSessions(7);
        setSleepSessions(sleep);
        console.log("[HealthDataDisplay] 수면 기록:", sleep);
      } catch (error) {
        console.error("[HealthDataDisplay] 수면 기록 가져오기 실패:", error);
      }

      // 산소포화도 가져오기 (최근 7일)
      try {
        const oxygen = await HealthConnectService.getOxygenSaturation(7);
        setOxygenData(oxygen);
        console.log("[HealthDataDisplay] 산소포화도:", oxygen);
      } catch (error) {
        console.error("[HealthDataDisplay] 산소포화도 가져오기 실패:", error);
      }
    } catch (error) {
      console.error("[HealthDataDisplay] Health Connect 데이터 로드 실패:", error);
      Alert.alert("오류", "건강 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadHealthData}
        activeOpacity={0.7}
      >
        <Text style={styles.refreshButtonText}>
          {isLoading ? "로딩 중..." : "데이터 새로고침"}
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.green} />
        </View>
      ) : (
        <>
          {/* 컨디션 요약 */}
          {conditionSummary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>오늘의 컨디션</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>걸음 수</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.totalSteps.toLocaleString()}걸음
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>평균 심박수</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.avgHeartRate > 0
                      ? `${Math.round(conditionSummary.avgHeartRate)}bpm`
                      : "-"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>산소포화도</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.oxygenSaturation > 0
                      ? `${conditionSummary.oxygenSaturation.toFixed(1)}%`
                      : "-"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>수면 시간</Text>
                  <Text style={styles.summaryValue}>
                    {formatDuration(conditionSummary.totalSleepMinutes)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>체온</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.bodyTemperature > 0
                      ? `${conditionSummary.bodyTemperature.toFixed(1)}°C`
                      : "-"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>혈압</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.systolicBloodPressure > 0
                      ? `${Math.round(conditionSummary.systolicBloodPressure)}/${Math.round(conditionSummary.diastolicBloodPressure)}mmHg`
                      : "-"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>평균 호흡수</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.avgRespiratoryRate > 0
                      ? `${conditionSummary.avgRespiratoryRate.toFixed(1)}회/분`
                      : "-"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>활동 칼로리</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.totalActiveCalories > 0
                      ? `${conditionSummary.totalActiveCalories}kcal`
                      : "-"}
                  </Text>
                </View>
                <View style={[styles.summaryItem, styles.summaryItemLast]}>
                  <Text style={styles.summaryLabel}>총 이동 거리</Text>
                  <Text style={styles.summaryValue}>
                    {conditionSummary.totalDistanceMeters > 0
                      ? `${conditionSummary.totalDistanceKm}km`
                      : "-"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 달리기 세션 */}
          {runningSessions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>최근 달리기 기록</Text>
              {runningSessions.slice(0, 5).map((session, index) => (
                <View key={session.id || index} style={styles.sessionCard}>
                  <Text style={styles.sessionTitle}>
                    {session.title || "달리기"}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {formatDate(session.startTime)} - {formatDate(session.endTime)}
                  </Text>
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionDetailText}>
                      거리: {session.distanceKm}km
                    </Text>
                    <Text style={styles.sessionDetailText}>
                      시간: {formatDuration(session.durationMinutes)}
                    </Text>
                    <Text style={styles.sessionDetailText}>
                      칼로리: {session.calories}kcal
                    </Text>
                  </View>
                  {session.avgPaceFormatted !== "-" && (
                    <View style={styles.sessionDetails}>
                      <Text style={styles.sessionDetailText}>
                        평균 페이스: {session.avgPaceFormatted}
                      </Text>
                      <Text style={styles.sessionDetailText}>
                        평균 속도: {session.avgSpeedKmh > 0 ? `${session.avgSpeedKmh.toFixed(1)}km/h` : "-"}
                      </Text>
                    </View>
                  )}
                  {(session.avgHeartRate > 0 || session.maxHeartRate > 0) && (
                    <View style={styles.sessionDetails}>
                      {session.avgHeartRate > 0 && (
                        <Text style={styles.sessionDetailText}>
                          평균 심박수: {Math.round(session.avgHeartRate)}bpm
                        </Text>
                      )}
                      {session.maxHeartRate > 0 && (
                        <Text style={styles.sessionDetailText}>
                          최대 심박수: {session.maxHeartRate}bpm
                        </Text>
                      )}
                    </View>
                  )}
                  {(session.avgTemperature > 0 || session.avgRespiratoryRate > 0) && (
                    <View style={styles.sessionDetails}>
                      {session.avgTemperature > 0 && (
                        <Text style={styles.sessionDetailText}>
                          평균 체온: {session.avgTemperature.toFixed(1)}°C
                        </Text>
                      )}
                      {session.avgRespiratoryRate > 0 && (
                        <Text style={styles.sessionDetailText}>
                          평균 호흡수: {session.avgRespiratoryRate.toFixed(1)}회/분
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* 수면 기록 */}
          {sleepSessions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>최근 수면 기록</Text>
              {sleepSessions.slice(0, 5).map((session, index) => (
                <View key={session.id || index} style={styles.sessionCard}>
                  <Text style={styles.sessionTitle}>
                    {session.title || "수면"}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {formatDate(session.startTime)} - {formatDate(session.endTime)}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.durationMinutes)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* 산소포화도 기록 */}
          {oxygenData.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>산소포화도 기록</Text>
              {oxygenData.slice(0, 5).map((record, index) => (
                <View key={index} style={styles.sessionCard}>
                  <Text style={styles.sessionTitle}>
                    {record.percentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.sessionTime}>
                    {formatDate(record.time)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshButton: {
    backgroundColor: palette.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  refreshButtonText: {
    color: palette.black,
    fontSize: 14,
    fontWeight: "700",
    ...typography.bold,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.white,
    marginBottom: 16,
    ...typography.bold,
  },
  summaryCard: {
    backgroundColor: palette.gray,
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.grayDark,
  },
  summaryItemLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: palette.grayLight,
    ...typography.regular,
  },
  summaryValue: {
    fontSize: 16,
    color: palette.white,
    fontWeight: "600",
    ...typography.semibold,
  },
  sessionCard: {
    backgroundColor: palette.gray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    color: palette.white,
    fontWeight: "600",
    marginBottom: 8,
    ...typography.semibold,
  },
  sessionTime: {
    fontSize: 12,
    color: palette.grayLight,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 12,
    color: palette.green,
  },
  sessionDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 12,
  },
  sessionDetailText: {
    fontSize: 12,
    color: palette.grayLight,
  },
});


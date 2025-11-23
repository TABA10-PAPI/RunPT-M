import { NativeModules } from "react-native";

const { HealthConnectModule } = NativeModules;

class HealthConnectService {
  /**
   * Health Connect 권한 요청
   * @returns {Promise<boolean>} 권한이 이미 허용되어 있으면 true
   */
  async requestPermissions() {
    try {
      if (!HealthConnectModule) {
        throw new Error("Health Connect Module is not available");
      }
      return await HealthConnectModule.requestPermissions();
    } catch (error) {
      console.error("[HealthConnect] 권한 요청 실패:", error);
      throw error;
    }
  }

  /**
   * 달리기 세션 가져오기
   * @param {number} days - 가져올 일수 (기본값: 7)
   * @returns {Promise<Array>} 달리기 세션 배열
   */
  async getRunningSessions(days = 7) {
    try {
      if (!HealthConnectModule) {
        throw new Error("Health Connect Module is not available");
      }
      const sessions = await HealthConnectModule.getRunningSessions(days);
      return sessions.map((session) => {
        // 페이스 포맷팅 (분'초"/km)
        const formatPace = (minutesPerKm) => {
          if (!minutesPerKm || minutesPerKm === 0) return "-";
          const minutes = Math.floor(minutesPerKm);
          const seconds = Math.round((minutesPerKm - minutes) * 60);
          return `${minutes}'${seconds.toString().padStart(2, "0")}"/km`;
        };

        return {
          id: session.id,
          title: session.title,
          startTime: new Date(session.startTimeEpoch),
          endTime: new Date(session.endTimeEpoch),
          startZoneId: session.startZoneId,
          endZoneId: session.endZoneId,
          durationMinutes: session.durationMinutes,
          distanceMeters: session.distanceMeters,
          distanceKm: (session.distanceMeters / 1000).toFixed(2),
          calories: session.calories,
          avgHeartRate: session.avgHeartRate,
          maxHeartRate: session.maxHeartRate,
          avgPaceMinutesPerKm: session.avgPaceMinutesPerKm,
          avgPaceFormatted: formatPace(session.avgPaceMinutesPerKm),
          avgSpeedKmh: session.avgSpeedKmh,
          avgTemperature: session.avgTemperature,
          avgRespiratoryRate: session.avgRespiratoryRate,
        };
      });
    } catch (error) {
      console.error("[HealthConnect] 달리기 세션 가져오기 실패:", error);
      throw error;
    }
  }

  /**
   * 산소포화도 가져오기
   * @param {number} days - 가져올 일수 (기본값: 7)
   * @returns {Promise<Array>} 산소포화도 기록 배열
   */
  async getOxygenSaturation(days = 7) {
    try {
      if (!HealthConnectModule) {
        throw new Error("Health Connect Module is not available");
      }
      const records = await HealthConnectModule.getOxygenSaturation(days);
      return records.map((record) => ({
        percentage: record.percentage,
        time: new Date(record.timeEpoch),
      }));
    } catch (error) {
      console.error("[HealthConnect] 산소포화도 가져오기 실패:", error);
      throw error;
    }
  }

  /**
   * 수면 기록 가져오기
   * @param {number} days - 가져올 일수 (기본값: 7)
   * @returns {Promise<Array>} 수면 세션 배열
   */
  async getSleepSessions(days = 7) {
    try {
      if (!HealthConnectModule) {
        throw new Error("Health Connect Module is not available");
      }
      const sessions = await HealthConnectModule.getSleepSessions(days);
      return sessions.map((session) => ({
        id: session.id,
        title: session.title,
        startTime: new Date(session.startTimeEpoch),
        endTime: new Date(session.endTimeEpoch),
        durationMinutes: session.durationMinutes,
        notes: session.notes,
      }));
    } catch (error) {
      console.error("[HealthConnect] 수면 기록 가져오기 실패:", error);
      throw error;
    }
  }

  /**
   * 컨디션 요약 가져오기 (오늘 기준)
   * @returns {Promise<Object>} 컨디션 요약 객체
   */
  async getConditionSummary() {
    try {
      if (!HealthConnectModule) {
        throw new Error("Health Connect Module is not available");
      }
      const summary = await HealthConnectModule.getConditionSummary();
      return {
        totalSteps: summary.totalSteps,
        avgHeartRate: summary.avgHeartRate,
        oxygenSaturation: summary.oxygenSaturation,
        totalSleepMinutes: summary.totalSleepMinutes,
        latestSleepStart: summary.latestSleepStart
          ? new Date(summary.latestSleepStart)
          : null,
        latestSleepEnd: summary.latestSleepEnd
          ? new Date(summary.latestSleepEnd)
          : null,
        bodyTemperature: summary.bodyTemperature,
        systolicBloodPressure: summary.systolicBloodPressure,
        diastolicBloodPressure: summary.diastolicBloodPressure,
        avgRespiratoryRate: summary.avgRespiratoryRate,
        totalActiveCalories: summary.totalActiveCalories,
        totalDistanceMeters: summary.totalDistanceMeters,
        totalDistanceKm: (summary.totalDistanceMeters / 1000).toFixed(2),
      };
    } catch (error) {
      console.error("[HealthConnect] 컨디션 요약 가져오기 실패:", error);
      throw error;
    }
  }
}

export default new HealthConnectService();


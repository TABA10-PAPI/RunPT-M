import { NativeModules } from "react-native";

// 디버깅: 등록된 모든 네이티브 모듈 확인
console.log("[HealthConnect] 등록된 네이티브 모듈:", Object.keys(NativeModules));

const { HealthConnectModule } = NativeModules;

// 디버깅: HealthConnectModule 확인
console.log("[HealthConnect] HealthConnectModule 존재 여부:", !!HealthConnectModule);

class HealthConnectService {
  /**
   * Health Connect 권한 요청
   * @returns {Promise<boolean>} 권한이 이미 허용되어 있으면 true, 권한 요청 Intent 실행 후 false
   */
  async requestPermissions() {
    try {
      if (!HealthConnectModule) {
        throw new Error("Health Connect Module is not available");
      }
      const result = await HealthConnectModule.requestPermissions();
      // 권한 요청 Intent가 실행된 경우, 잠시 후 다시 확인
      if (result === false) {
        console.log("[HealthConnect] 권한 요청 Intent 실행됨. 사용자가 권한을 허용할 때까지 대기...");
        // 1초 후 다시 확인
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // 다시 권한 확인
        return await HealthConnectModule.requestPermissions();
      }
      return result;
    } catch (error) {
      console.error("[HealthConnect] 권한 요청 실패:", error);
      throw error;
    }
  }

  /**
   * 달리기 세션 가져오기 (페이스, 평균 심박, 총거리, 시간)
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
          durationMinutes: session.durationMinutes,
          distanceMeters: session.distanceMeters,
          distanceKm: (session.distanceMeters / 1000).toFixed(2),
          avgHeartRate: session.avgHeartRate,
          avgPaceMinutesPerKm: session.avgPaceMinutesPerKm,
          avgPaceFormatted: formatPace(session.avgPaceMinutesPerKm),
        };
      });
    } catch (error) {
      console.error("[HealthConnect] 달리기 세션 가져오기 실패:", error);
      throw error;
    }
  }

  /**
   * 테스트용: Health Connect 데이터 로드 및 콘솔 출력
   * @param {number} days - 가져올 일수 (기본값: 7)
   */
  async testLoadHealthData(days = 7) {
    try {
      console.log("[HealthConnect] Health Connect 데이터 로드 시작");

      // 권한 요청
      try {
        await this.requestPermissions();
        console.log("[HealthConnect] 권한 요청 성공");
      } catch (error) {
        if (error.code === "NEED_USER_ACTION") {
          console.warn(
            "[HealthConnect] 권한 필요: Health Connect 권한이 필요합니다."
          );
          return;
        }
        console.error("[HealthConnect] 권한 요청 실패:", error);
        return;
      }

      // 달리기 세션 가져오기
      try {
        const sessions = await this.getRunningSessions(days);
        console.log("[HealthConnect] 달리기 세션 데이터:", JSON.stringify(sessions, null, 2));
        console.log(`[HealthConnect] 총 ${sessions.length}개의 달리기 세션`);
        
        // 각 세션 상세 정보 로그
        sessions.forEach((session, index) => {
          console.log(`[HealthConnect] 세션 ${index + 1}:`, {
            거리: `${session.distanceKm}km`,
            시간: `${session.durationMinutes}분`,
            평균_페이스: session.avgPaceFormatted,
            평균_심박수: session.avgHeartRate > 0 ? `${Math.round(session.avgHeartRate)}bpm` : "없음",
          });
        });

        return sessions;
      } catch (error) {
        console.error("[HealthConnect] 달리기 세션 가져오기 실패:", error);
        throw error;
      }
    } catch (error) {
      console.error("[HealthConnect] Health Connect 데이터 로드 실패:", error);
      throw error;
    }
  }
}

export default new HealthConnectService();

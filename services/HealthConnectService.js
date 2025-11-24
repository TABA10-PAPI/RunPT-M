import { NativeModules, Platform, TurboModuleRegistry } from "react-native";

// HealthConnectModule 로드
console.log("[HealthConnect] HealthConnectService 모듈 로드 시작...");

// New Architecture에서는 TurboModuleRegistry 사용
let HealthConnectModule = null;

if (TurboModuleRegistry) {
  try {
    HealthConnectModule = TurboModuleRegistry.get("HealthConnectModule");
    console.log("[HealthConnect] ✅ TurboModule에서 HealthConnectModule 로드 성공");
  } catch (e) {
    console.log("[HealthConnect] TurboModule 로드 실패, Legacy 방식 시도:", e);
    HealthConnectModule = NativeModules.HealthConnectModule;
  }
} else {
  // Legacy 방식 (New Architecture 비활성화 시)
  HealthConnectModule = NativeModules.HealthConnectModule;
  console.log("[HealthConnect] Legacy NativeModules 사용");
}

// HealthConnectModule 최종 확인
if (!HealthConnectModule) {
  console.error("[HealthConnect] ❌ HealthConnectModule을 로드할 수 없습니다!");
} else {
  console.log("[HealthConnect] ✅ HealthConnectModule 로드 완료");
}

console.log("[HealthConnect] ⚙️ HealthConnectService 모듈 로드 완료");

class HealthConnectService {
  /**
   * Health Connect 권한 요청
   * @returns {Promise<boolean>} 권한이 이미 허용되어 있으면 true, 권한 요청 Intent 실행 후 false
   */
  async requestPermissions() {
    try {
      console.log("\n========================================");
      console.log("[HealthConnect] 권한 요청 시작...");
      console.log("========================================");
      
      if (!HealthConnectModule) {
        console.error("[HealthConnect] ❌ HealthConnectModule을 사용할 수 없습니다.");
        throw new Error("Health Connect Module is not available");
      }
      
      console.log("[HealthConnect] 네이티브 모듈 호출 중...");
      const result = await HealthConnectModule.requestPermissions();
      console.log("[HealthConnect] 네이티브 모듈 응답:", result);
      
      // 권한이 이미 허용되어 있으면 바로 반환
      if (result === true) {
        console.log("[HealthConnect] ✅ 모든 권한이 이미 허용되어 있습니다.");
        console.log("========================================\n");
        return true;
      }
      
      // 권한 요청 Intent가 실행된 경우
      // 사용자가 권한 다이얼로그에서 허용/거부를 선택할 때까지 대기
      console.log("[HealthConnect] ⏳ 권한 요청 다이얼로그가 표시되었습니다.");
      console.log("[HealthConnect] 사용자가 권한을 허용할 때까지 대기 중...");
      console.log("========================================\n");
      
      // HealthConnectModule.kt의 onActivityResult에서 결과를 처리하므로
      // 여기서는 false를 반환 (실제 권한 결과는 onActivityResult에서 처리)
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
      console.log(`[HealthConnect] getRunningSessions() 호출 - ${days}일`);
      
      if (!HealthConnectModule) {
        console.error("[HealthConnect] HealthConnectModule을 사용할 수 없습니다.");
        throw new Error("Health Connect Module is not available");
      }
      
      console.log("[HealthConnect] 네이티브 모듈 호출 중...");
      const sessions = await HealthConnectModule.getRunningSessions(days);
      console.log(`[HealthConnect] 네이티브 모듈 응답 받음 - ${sessions?.length || 0}개 세션`);
      
      if (!sessions || !Array.isArray(sessions)) {
        console.error("[HealthConnect] 세션 데이터가 배열이 아닙니다:", sessions);
        return [];
      }
      
      console.log("[HealthConnect] 세션 데이터 매핑 시작...");
      const mappedSessions = sessions.map((session) => {
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
      
      console.log(`[HealthConnect] 세션 데이터 매핑 완료 - ${mappedSessions.length}개`);
      return mappedSessions;
    } catch (error) {
      console.error("\n========================================");
      console.error("❌ getRunningSessions 실패");
      console.error("========================================");
      console.error("[HealthConnect] 에러 메시지:", error.message);
      console.error("[HealthConnect] 에러 코드:", error.code);
      console.error("[HealthConnect] 전체 에러:", error);
      console.error("========================================\n");
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
        console.log(`[HealthConnect] 달리기 세션 조회 시작 - 최근 ${days}일`);
        const sessions = await this.getRunningSessions(days);
        
        console.log("\n========================================");
        console.log("🏃 Health Connect 조회 완료!");
        console.log("========================================");
        console.log(`📊 총 ${sessions.length}개의 달리기 세션 발견`);
        console.log("========================================");
        
        if (sessions.length === 0) {
          console.log("⚠️ 조회된 달리기 세션이 없습니다.");
          console.log("   Health Connect 앱에 러닝 데이터가 있는지 확인해주세요.");
          console.log("========================================\n");
          return sessions;
        }

        // 전체 통계 계산
        const totalDistance = sessions.reduce((sum, s) => sum + parseFloat(s.distanceKm), 0);
        const totalDuration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
        const avgPaceSessions = sessions.filter(s => s.avgPaceMinutesPerKm > 0);
        const avgPace = avgPaceSessions.length > 0 
          ? avgPaceSessions.reduce((sum, s) => sum + s.avgPaceMinutesPerKm, 0) / avgPaceSessions.length 
          : 0;
        const avgHeartRateSessions = sessions.filter(s => s.avgHeartRate > 0);
        const avgHeartRate = avgHeartRateSessions.length > 0
          ? avgHeartRateSessions.reduce((sum, s) => sum + s.avgHeartRate, 0) / avgHeartRateSessions.length
          : 0;

        // 요약 통계 출력
        console.log("\n📈 요약 통계:");
        console.log(`   총 거리: ${totalDistance.toFixed(2)} km`);
        console.log(`   총 시간: ${totalDuration} 분 (${(totalDuration / 60).toFixed(1)} 시간)`);
        if (avgPace > 0) {
          const paceMin = Math.floor(avgPace);
          const paceSec = Math.round((avgPace - paceMin) * 60);
          console.log(`   평균 페이스: ${paceMin}'${paceSec.toString().padStart(2, "0")}"/km`);
        }
        if (avgHeartRate > 0) {
          console.log(`   평균 심박수: ${Math.round(avgHeartRate)} bpm`);
        }
        console.log("\n----------------------------------------\n");
        
        // 각 세션 상세 정보 출력
        console.log("📋 세션 상세 정보:");
        sessions.forEach((session, index) => {
          console.log(`\n[세션 ${index + 1}/${sessions.length}]`);
          console.log(`   거리: ${session.distanceKm} km`);
          console.log(`   시간: ${session.durationMinutes} 분`);
          if (session.avgPaceFormatted !== "-") {
            console.log(`   평균 페이스: ${session.avgPaceFormatted}`);
          }
          if (session.avgHeartRate > 0) {
            console.log(`   평균 심박수: ${Math.round(session.avgHeartRate)} bpm`);
          } else {
            console.log(`   평균 심박수: 기록 없음`);
          }
        });

        console.log("\n========================================");
        console.log("✅ Health Connect 데이터 로드 완료!");
        console.log("========================================\n");

        // JSON 데이터도 출력 (디버깅용)
        console.log("[HealthConnect] 전체 세션 데이터 (JSON):");
        console.log(JSON.stringify(sessions, null, 2));
        console.log("\n");

        return sessions;
      } catch (error) {
        console.error("\n========================================");
        console.error("❌ 달리기 세션 가져오기 실패");
        console.error("========================================");
        console.error("[HealthConnect] 에러 메시지:", error.message);
        console.error("[HealthConnect] 에러 코드:", error.code);
        console.error("[HealthConnect] 에러 스택:", error.stack);
        console.error("========================================\n");
        throw error;
      }
    } catch (error) {
      console.error("\n========================================");
      console.error("❌ Health Connect 데이터 로드 실패");
      console.error("========================================");
      console.error("[HealthConnect] 에러:", error);
      console.error("========================================\n");
      throw error;
    }
  }
}

export default new HealthConnectService();

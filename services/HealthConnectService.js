import {
    initialize,
    requestPermission,
    readRecords,
  } from 'react-native-health-connect';
import apiClient from '@config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Health Connect 서비스
 * - Android Health Connect에서 러닝 데이터 읽기
 * - 거리, 심박수, 시간 데이터를 가져와서 백엔드로 전송
 */
const readRunningData = async () => {
  try {
    // uid를 먼저 가져와서 uid별 마지막 처리 시간 관리
    const uid = await AsyncStorage.getItem('uid');
    if (!uid) {
      return null;
    }

    const uidNumber = Number(uid);
    if (isNaN(uidNumber) || uidNumber <= 0) {
      return null;
    }

    const isInitialized = await initialize();
    if (!isInitialized) {
      return null;
    }

    const withTimeout = (promise, timeoutMs) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        ),
      ]);
    };

    let grantedPermissions = null;
    try {
      grantedPermissions = await withTimeout(
        requestPermission([{ accessType: 'read', recordType: 'ActiveCaloriesBurned' }]),
        30000
      );

      if (grantedPermissions) {
        const additionalPermissions = [
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'Distance' },
          { accessType: 'read', recordType: 'Steps' },
        ];

        for (const perm of additionalPermissions) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const result = await withTimeout(requestPermission([perm]), 30000);
            if (result && Array.isArray(result) && result.length > 0) {
              if (!Array.isArray(grantedPermissions)) {
                grantedPermissions = [];
              }
              grantedPermissions.push(...result);
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err) {
            // 개별 권한 실패해도 계속 진행
          }
        }
      }
    } catch (err) {
      return null;
    }

    const allowedRecordTypes = new Set();
    if (grantedPermissions && Array.isArray(grantedPermissions)) {
      grantedPermissions.forEach((perm) => {
        if (perm && perm.recordType) {
          allowedRecordTypes.add(perm.recordType);
        }
      });
    }

    if (allowedRecordTypes.size === 0) {
      return null;
    }

    const LAST_PROCESSED_TIME_KEY = `healthConnectLastProcessedTime_${uidNumber}`;
    let lastProcessedTime = await AsyncStorage.getItem(LAST_PROCESSED_TIME_KEY);
    const rightNow = new Date();
    let filterStartTime = null;
    
    if (lastProcessedTime) {
      filterStartTime = new Date(lastProcessedTime);
    } else {
      filterStartTime = new Date(rightNow.getTime() - 24 * 60 * 60 * 1000);
    }

    const timeRangeFilter = {
        operator: 'between',
      startTime: filterStartTime.toISOString(),
      endTime: rightNow.toISOString(),
    };

    let distanceData = null;
    let heartRateData = null;

    if (allowedRecordTypes.has('Distance')) {
      try {
        const result = await readRecords('Distance', { timeRangeFilter });
        const records = result?.records || result || [];
        if (Array.isArray(records) && records.length > 0) {
          distanceData = records;
        }
      } catch (err) {
      }
    }

    if (allowedRecordTypes.has('HeartRate')) {
      try {
        const result = await readRecords('HeartRate', { timeRangeFilter });
        const records = result?.records || result || [];
        if (Array.isArray(records) && records.length > 0) {
          heartRateData = records;
        }
      } catch (err) {
        // 에러 무시
      }
    }

    // 데이터가 없으면 종료
    if (!distanceData || distanceData.length === 0) {
      return null;
    }

    // Distance 데이터 필터링 (startTime 또는 endTime이 있는 레코드만)
    const validDistance = distanceData.filter((record) => {
      return record.startTime || record.endTime || record.time;
    });

    if (validDistance.length === 0) {
      return null;
    }

    // 가장 최근의 운동 세션 찾기 (최근 레코드의 endTime 기준)
    const sortedByEndTime = validDistance
      .filter((record) => record.endTime || record.startTime || record.time)
      .sort((a, b) => {
        const timeA = new Date(a.endTime || a.startTime || a.time || 0);
        const timeB = new Date(b.endTime || b.startTime || b.time || 0);
        return timeB - timeA; // 최근 순으로 정렬
      });

    if (sortedByEndTime.length === 0) {
      return null;
    }

    // 가장 최근 레코드의 endTime을 기준으로 최근 2시간 이내의 레코드들 찾기
    const latestRecord = sortedByEndTime[0];
    const latestEndTime = new Date(latestRecord.endTime || latestRecord.startTime || latestRecord.time);
    const twoHoursAgo = new Date(latestEndTime.getTime() - 2 * 60 * 60 * 1000);

    const sessionRecords = validDistance.filter((record) => {
      const recordStart = new Date(record.startTime || record.endTime || record.time);
      const recordEnd = new Date(record.endTime || record.startTime || record.time);
      // 레코드가 2시간 이내 시간 범위에 있으면 포함
      return (recordStart >= twoHoursAgo || recordEnd >= twoHoursAgo);
    });

    if (sessionRecords.length === 0) {
      return null;
    }

    // 모든 레코드 중 가장 빠른 startTime과 가장 늦은 endTime 찾기
    let earliestStartTime = null;
    let latestEndTime_session = null;
    let totalDurationMs = 0;

    sessionRecords.forEach((record) => {
      const recordStart = new Date(record.startTime || record.endTime || record.time);
      const recordEnd = new Date(record.endTime || record.startTime || record.time);

      // 각 레코드의 시간 범위 계산
      const recordDuration = Math.max(0, recordEnd - recordStart);
      
      // 각 레코드의 시간 범위를 합산 (중복 구간 제외를 위해 최소/최대 시간으로도 계산)
      if (recordDuration > 0) {
        totalDurationMs += recordDuration;
      }

      if (!earliestStartTime || recordStart < earliestStartTime) {
        earliestStartTime = recordStart;
      }
      if (!latestEndTime_session || recordEnd > latestEndTime_session) {
        latestEndTime_session = recordEnd;
      }
    });

    if (!earliestStartTime || !latestEndTime_session) {
      return null;
    }

    const startTime = earliestStartTime;
    const endTime = latestEndTime_session;
    
    // 운동 총 시간 계산 (초 단위)
    // 전체 시간 범위(가장 빠른 startTime ~ 가장 늦은 endTime)를 사용
    const totalRangeMs = endTime.getTime() - startTime.getTime();
    const durationSec = Math.floor(totalRangeMs / 1000); // 밀리초를 초로 변환

    // 거리 계산 (미터 단위, m)
    let distance = 0; // 미터
    sessionRecords.forEach((record) => {
      const distanceInMeters = record.length?.inMeters || record.distance?.inMeters || 0;
      distance += distanceInMeters;
    });
    distance = Math.round(distance); // 미터 단위로 반올림

    // 평균 심박수 계산
    let heartRateAvg = 0;
    if (heartRateData && heartRateData.length > 0) {
      const sessionHeartRate = heartRateData.filter((record) => {
        const recordTime = new Date(record.time || record.startTime || record.endTime);
        return recordTime >= startTime && recordTime <= endTime;
      });

      if (sessionHeartRate.length > 0) {
        const totalHeartRate = sessionHeartRate.reduce((sum, record) => {
          const bpm = record.beatsPerMinute || record.heartRate || 0;
          return sum + bpm;
        }, 0);
        heartRateAvg = Math.round(totalHeartRate / sessionHeartRate.length);
      }
    }

    // 페이스 계산 (초/km, sec/km)
    // pace = 총 시간(초) / 거리(km)
    let pace = 0; // 초/km
    if (distance > 0 && durationSec > 0) {
      const distanceKm = distance / 1000; // 미터를 킬로미터로 변환
      pace = Math.round(durationSec / distanceKm); // 초/km (소수점 반올림)
    }

    // 결과 생성
    const exerciseEndTime = endTime; // 운동 종료 시간 저장 (마지막 처리 시간 업데이트용)
    const result = {
      date: startTime.toISOString(),
      pace: pace, // 초/km (sec/km)
      distance: distance, // 미터 (m)
      durationSec: durationSec, // 운동 총 시간 (초, sec)
      heartRateAvg: heartRateAvg,
    };

    // 백엔드로 데이터 전송
    const requestData = {
      uid: uidNumber,
      date: result.date,
      pace: result.pace,
      distance: result.distance,
      durationSec: result.durationSec,
      heartRateAvg: result.heartRateAvg,
    };

    try {
      const response = await apiClient.post('/user/save-running', requestData);
      const responseData = response?.data;
      
      if (responseData && responseData.code === 'SU') {
        // 성공적으로 저장되면 해당 uid의 마지막 처리 시간 업데이트 (운동 종료 시간 기준)
        // 다음번에는 이 시간 이후의 기록만 가져오도록 함
        await AsyncStorage.setItem(LAST_PROCESSED_TIME_KEY, exerciseEndTime.toISOString());
      }
    } catch (apiError) {
      // API 전송 실패해도 로컬 결과는 반환
    }

    return result;
  } catch (error) {
    return null;
  }
};

export default readRunningData;
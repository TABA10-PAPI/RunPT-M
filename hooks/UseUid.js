import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * uid를 쉽게 가져오고 관리하는 커스텀 훅
 * @returns {Object} { uid, isLoading, setUid, clearUid }
 */
export const useUid = () => {
  const [uid, setUidState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 AsyncStorage에서 uid 로드
  useEffect(() => {
    loadUid();
  }, []);

  const loadUid = async () => {
    try {
      const storedUid = await AsyncStorage.getItem("uid");
      setUidState(storedUid);
    } catch (error) {
      // uid 로드 실패
    } finally {
      setIsLoading(false);
    }
  };

  // uid 저장
  const setUid = async (newUid) => {
    try {
      await AsyncStorage.setItem("uid", String(newUid));
      setUidState(String(newUid));
    } catch (error) {
      // uid 저장 실패
    }
  };

  // uid 삭제 (로그아웃 시)
  const clearUid = async () => {
    try {
      await AsyncStorage.removeItem("uid");
      setUidState(null);
    } catch (error) {
      // uid 삭제 실패
    }
  };

  return {
    uid,
    isLoading,
    setUid,
    clearUid,
  };
};


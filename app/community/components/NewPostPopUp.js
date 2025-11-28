import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import apiClient from "@config/api";
import { useUid } from "@hooks/UseUid";
import { palette, typography } from "@styles/globalStyles";
import FilterChip from "./FilterChip";

const iconX = require("@assets/community/X.png");
const iconMenuSeparator = require("@assets/community/Menu_Separator.png");

export default function NewPostPopUp({ visible, onClose, onSubmit }) {
  const { uid } = useUid();
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [startTime, setStartTime] = useState("");
  const [content, setContent] = useState("");
  const [distance, setDistance] = useState("5");
  const [duration, setDuration] = useState("40");
  const [paceMin, setPaceMin] = useState("6");
  const [paceSec, setPaceSec] = useState("30");
  const [targetGender, setTargetGender] = useState("ALL");

  const targetGenderOptions = [
    { label: "전체", value: "ALL" },
    { label: "남성", value: "M" },
    { label: "여성", value: "F" },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 거리와 페이스로부터 예상 소요시간 계산 (분)
  const calculatedDuration = useMemo(() => {
    const distanceNum = Number(distance) || 0;
    const paceMinNum = Number(paceMin) || 0;
    const paceSecNum = Number(paceSec) || 0;
    
    if (distanceNum <= 0 || (paceMinNum <= 0 && paceSecNum <= 0)) {
      return "";
    }
    
    // 페이스를 분 단위로 변환 (예: 6'30" = 6 + 30/60 = 6.5분)
    const paceInMinutes = paceMinNum + paceSecNum / 60;
    
    // 총 소요시간 계산: 거리(km) × 페이스(분/km)
    const totalMinutes = distanceNum * paceInMinutes;
    
    // 소수점 반올림
    return Math.round(totalMinutes).toString();
  }, [distance, paceMin, paceSec]);

  // duration을 자동 계산된 값으로 설정
  useEffect(() => {
    if (calculatedDuration) {
      setDuration(calculatedDuration);
    }
  }, [calculatedDuration]);

  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim() || !place.trim() || !startTime.trim() || !content.trim()) {
      Alert.alert("입력 오류", "모든 필드를 입력해주세요.");
      return;
    }

    if (!distance || !paceMin || !paceSec) {
      Alert.alert("입력 오류", "러닝 정보를 모두 입력해주세요.");
      return;
    }

    if (!uid) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    // uid를 숫자로 변환
    const uidNumber = Number(uid);
    if (isNaN(uidNumber) || uidNumber <= 0) {
      Alert.alert("오류", "유효하지 않은 사용자 정보입니다. 다시 로그인해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const targetpace = `${paceMin}'${paceSec}"`;

      // 백엔드로 전송할 데이터 준비
      const requestData = {
        uid: uidNumber,
        title: title.trim(),
        startpoint: place,
        distance: Number(distance),
        starttime: startTime,
        targetpace: targetpace,
        targetgender: targetGender,
        shortinfo: content,
      };

      console.log("[NewPostPopUp] 백엔드로 전송하는 데이터:", {
        ...requestData,
        uid: uidNumber,
      });

      // POST /community/add
      await apiClient.post("/community/add", requestData);
      
      const postData = {
        title: title.trim(),
        startpoint: place,
        distance: Number(distance),
        starttime: startTime,
        targetpace: targetpace,
        targetgender: targetGender,
        shortinfo: content,
      };
      
      onSubmit(postData);
      handleClose();
    } catch (error) {
      Alert.alert(
        "오류",
        error.response?.data?.message || "게시물 작성에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // 폼 초기화
    setTitle("");
    setPlace("");
    setStartTime("");
    setContent("");
    setDistance("5");
    setDuration("40");
    setPaceMin("6");
    setPaceSec("30");
    setTargetGender("ALL");
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.popupContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Image
                source={iconX}
                style={styles.closeIcon}
                tintColor={palette.white}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>글 작성하기</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={palette.green} />
              ) : (
                <Text style={styles.submitButtonText}>완료</Text>
              )}
            </TouchableOpacity>

          </View>
          <Image
            source={iconMenuSeparator}
            style={styles.separator}
            resizeMode="contain"
          />


          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 제목 입력 */}
            <View style={styles.section}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.input}
                placeholder="게시글 제목을 입력하세요"
                placeholderTextColor={palette.grayPlaceholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* 장소 입력 */}
            <View style={styles.section}>
              <Text style={styles.label}>장소</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 죽전역 앞 엑스파크 공원"
                placeholderTextColor={palette.grayPlaceholder}
                value={place}
                onChangeText={setPlace}
              />
            </View>

            {/* 출발시간 입력 */}
            <View style={styles.section}>
              <Text style={styles.label}>출발시간</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 오후 7시 30분"
                placeholderTextColor={palette.grayPlaceholder}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>

            {/* 내용 입력 */}
            <View style={styles.section}>
              <Text style={styles.label}>내용</Text>
              <TextInput
                style={styles.textArea}
                placeholder="함께 달릴 내용을 작성해주세요"
                placeholderTextColor={palette.grayPlaceholder}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* 원하는 성별 선택 */}
            <View style={styles.section}>
              <Text style={styles.label}>원하는 성별</Text>
              <View style={styles.chipContainer}>
                {targetGenderOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    isActive={targetGender === option.value}
                    onPress={() => setTargetGender(option.value)}
                  />
                ))}
              </View>
            </View>

            {/* 러닝 정보 섹션 */}
            <View style={styles.section}>
              {/* 러닝 정보 컨테이너 */}
              <View style={styles.runningInfoContainer}>
                <Text style={styles.runningInfoHeader}>러닝 정보</Text>
                {/* 거리 */}
                <View style={styles.runningInfoItem}>
                  <Text style={styles.runningInfoLabel}>거리</Text>
                  <View style={styles.inputWithUnitRow}>
                    <TextInput
                      style={styles.numberInputSmall}
                      placeholder="5"
                      placeholderTextColor={palette.grayPlaceholder}
                      value={distance}
                      onChangeText={setDistance}
                      keyboardType="numeric"
                    />
                    <Text style={styles.unit}>KM</Text>
                  </View>
                </View>

                {/* 예상 소요시간 */}
                <View style={styles.runningInfoItem}>
                  <Text style={styles.runningInfoLabel}>예상 소요시간 (분)</Text>
                  <View style={styles.inputWithUnitRow}>
                    <TextInput
                      style={[styles.numberInputSmall, styles.readOnlyInput]}
                      placeholder="자동 계산"
                      placeholderTextColor={palette.grayPlaceholder}
                      value={duration}
                      editable={false}
                      keyboardType="numeric"
                    />
                    <Text style={styles.unit}>분</Text>
                  </View>
                </View>

                {/* 페이스 */}
                <View style={[styles.runningInfoItem, styles.runningInfoItemLast]}>
                  <Text style={styles.runningInfoLabel}>페이스 (분'초"/KM)</Text>
                  <View style={styles.paceContainerRow}>
                    <View style={styles.paceInputContainer}>
                      <TextInput
                        style={styles.paceInput}
                        placeholder="6"
                        placeholderTextColor={palette.grayPlaceholder}
                        value={paceMin}
                        onChangeText={setPaceMin}
                        keyboardType="numeric"
                      />
                      <Text style={styles.paceSeparator}>'</Text>
                      <TextInput
                        style={styles.paceInput}
                        placeholder="30"
                        placeholderTextColor={palette.grayPlaceholder}
                        value={paceSec}
                        onChangeText={setPaceSec}
                        keyboardType="numeric"
                      />
                    </View>
                    <Text style={styles.paceUnit}>"/KM</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1,
  },
  popupContainer: {
    backgroundColor: palette.grayDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    width: "100%",
    flexShrink: 1,
    zIndex: 2,
  },
  header: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  separator: {
    width: 400,
    height: 10,
    marginBottom: 10,
    tintColor: palette.white,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.white,
    ...typography.bold,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.green,
    ...typography.bold,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
    marginBottom: 12,
    ...typography.semibold,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  input: {
    backgroundColor: palette.grayMedium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: palette.white,
    ...typography.regular,
  },
  textArea: {
    backgroundColor: palette.grayMedium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: palette.white,
    minHeight: 120,
    ...typography.regular,
  },
  runningInfoHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.green,
    marginBottom: 16,
    ...typography.semibold,
  },
  runningInfoContainer: {
    backgroundColor: palette.black,
    borderRadius: 12,
    padding: 16,
  },
  runningInfoItem: {
    marginBottom: 16,
  },
  runningInfoItemLast: {
    marginBottom: 0,
  },
  runningInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
    marginBottom: 8,
    ...typography.semibold,
  },
  inputWithUnitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInputSmall: {
    width: 200,
    backgroundColor: palette.grayMedium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: palette.grayLight,
    ...typography.regular,
  },
  readOnlyInput: {
    opacity: 0.7,
  },
  unit: {
    fontSize: 12,
    color: palette.grayLight,
    marginLeft: 8,
  },
  paceContainerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.grayMedium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  paceInput: {
    width: 100,
    fontSize: 14,
    color: palette.grayLight,
    textAlign: "left",
    ...typography.regular,
  },
  paceSeparator: {
    fontSize: 14,
    color: palette.grayLight,
    marginHorizontal: 4,
  },
  paceUnit: {
    fontSize: 12,
    color: palette.grayLight,
    marginLeft: 8,
  },
});


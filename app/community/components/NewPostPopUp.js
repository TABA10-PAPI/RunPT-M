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
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import apiClient from "@config/api";
import { useUid } from "@hooks/UseUid";
import { palette, typography } from "@styles/globalStyles";
import FilterChip from "./FilterChip";

/**
 * 새 게시물 작성 팝업
 * - 게시물 작성 폼 (제목, 장소, 출발시간, 내용, 거리, 페이스, 성별 필터)
 * - 거리와 페이스로부터 자동으로 소요시간 계산
 */
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

  // 거리와 페이스로부터 예상 소요시간 자동 계산
  const calculatedDuration = useMemo(() => {
    const distanceNum = Number(distance) || 0;
    const paceMinNum = Number(paceMin) || 0;
    const paceSecNum = Number(paceSec) || 0;
    
    if (distanceNum <= 0 || (paceMinNum <= 0 && paceSecNum <= 0)) {
      return "";
    }
    
    const paceInMinutes = paceMinNum + paceSecNum / 60;
    const totalMinutes = distanceNum * paceInMinutes;
    return Math.round(totalMinutes).toString();
  }, [distance, paceMin, paceSec]);

  useEffect(() => {
    if (calculatedDuration) {
      setDuration(calculatedDuration);
    }
  }, [calculatedDuration]);

  // 게시물 작성 제출
  const handleSubmit = async () => {
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

    const uidNumber = Number(uid);
    if (isNaN(uidNumber) || uidNumber <= 0) {
      Alert.alert("오류", "유효하지 않은 사용자 정보입니다. 다시 로그인해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const targetpace = `${paceMin}'${paceSec}"`;
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

      await apiClient.post("/community/add", requestData);
      
      onSubmit();
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

  // 팝업 닫기 및 폼 초기화
  const handleClose = () => {
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        enabled={Platform.OS === "ios"}
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
              <Icon name="x-circle" size={24} color={palette.white} />
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
          <View style={styles.separator} />


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
                underlineColorAndroid="transparent"
                autoFocus={false}
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
                underlineColorAndroid="transparent"
                autoFocus={false}
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
                underlineColorAndroid="transparent"
                autoFocus={false}
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
                underlineColorAndroid="transparent"
                autoFocus={false}
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
                      underlineColorAndroid="transparent"
                      autoFocus={false}
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
                      underlineColorAndroid="transparent"
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
                        underlineColorAndroid="transparent"
                        autoFocus={false}
                      />
                      <Text style={styles.paceSeparator}>'</Text>
                      <TextInput
                        style={styles.paceInput}
                        placeholder="30"
                        placeholderTextColor={palette.grayPlaceholder}
                        value={paceSec}
                        onChangeText={setPaceSec}
                        keyboardType="numeric"
                        underlineColorAndroid="transparent"
                        autoFocus={false}
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
  separator: {
    flex: 17,
    borderBottomWidth: 1,
    width: "100%",
    borderBottomColor: '#E1E2E4',
    marginBottom: 10,
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
    borderWidth: 0,
    outlineStyle: "none",
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
    borderWidth: 0,
    outlineStyle: "none",
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
    borderWidth: 0,
    outlineStyle: "none",
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
    borderWidth: 0,
    outlineStyle: "none",
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


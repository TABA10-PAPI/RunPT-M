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

export default function EditPostPopUp({ visible, onClose, onSubmit, post }) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetGenderOptions = [
    { label: "전체", value: "ALL" },
    { label: "남성", value: "M" },
    { label: "여성", value: "F" },
  ];

  // post가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (post && visible) {
      setTitle(post.location || post.apiData?.title || "");
      setPlace(post.place || post.apiData?.startpoint || "");
      setStartTime(post.startTime || post.apiData?.starttime || "");
      setContent(post.description || post.apiData?.shortinfo || "");
      
      // distance 파싱 (예: "5KM" -> "5")
      const distanceStr = post.distance || post.apiData?.distance || "5";
      const distanceNum = distanceStr.toString().replace("KM", "").replace("km", "").trim();
      setDistance(distanceNum || "5");
      
      // pace 파싱 (예: "6'30"" -> paceMin: "6", paceSec: "30")
      const paceStr = post.pace || post.apiData?.targetpace || "6'30\"";
      const paceMatch = paceStr.match(/(\d+)'(\d+)"/) || paceStr.match(/(\d+)'(\d+)/);
      if (paceMatch) {
        setPaceMin(paceMatch[1] || "6");
        setPaceSec(paceMatch[2] || "30");
      }
      
      setTargetGender(post.apiData?.targetgender || "ALL");
    }
  }, [post, visible]);

  // 거리와 페이스로부터 예상 소요시간 계산 (분)
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

  const handleSubmit = async () => {
    if (!title.trim() || !place.trim() || !startTime.trim() || !content.trim()) {
      Alert.alert("입력 오류", "모든 필드를 입력해주세요.");
      return;
    }

    if (!distance || !paceMin || !paceSec) {
      Alert.alert("입력 오류", "러닝 정보를 모두 입력해주세요.");
      return;
    }

    if (!uid || !post?.id) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    const uidNumber = Number(uid);
    if (isNaN(uidNumber) || uidNumber <= 0) {
      Alert.alert("오류", "유효하지 않은 사용자 정보입니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const targetpace = `${paceMin}'${paceSec}"`;
      const communityId = post.id || post.apiData?.id;

      
      const requestData = {
        id: Number(communityId),
        uid: uidNumber,
        title: title.trim(),
        startpoint: place,
        distance: Number(distance),
        starttime: startTime,
        targetpace: targetpace,
        targetgender: targetGender,
        shortinfo: content,
      };

      
      await apiClient.post("/community/update", requestData);
      
      onSubmit();
      handleClose();
    } catch (error) {
      Alert.alert(
        "오류",
        error.response?.data?.message || "게시물 수정에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Icon name="x-circle" size={24} color={palette.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>글 수정하기</Text>
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

            <View style={styles.section}>
              <View style={styles.runningInfoContainer}>
                <Text style={styles.runningInfoHeader}>러닝 정보</Text>
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


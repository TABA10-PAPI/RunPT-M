import React, { useState } from "react";
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
} from "react-native";
import { palette, typography } from "@styles/globalStyles";
import FilterChip from "./FilterChip";

const iconX = require("@assets/community/X.png");
const iconMenuSeparator = require("@assets/community/Menu_Separator.png");

export default function NewPostPopUp({ visible, onClose, onSubmit }) {
  const [selectedLocation, setSelectedLocation] = useState("수지구 죽전동");
  const [place, setPlace] = useState("");
  const [startTime, setStartTime] = useState("");
  const [content, setContent] = useState("");
  const [distance, setDistance] = useState("5");
  const [duration, setDuration] = useState("40");
  const [paceMin, setPaceMin] = useState("6");
  const [paceSec, setPaceSec] = useState("30");

  // TODO: 백엔드에서 지역 옵션 받아오기
  // GET /community/locations 또는 유사한 API
  const locationOptions = ["수지구 죽전동", "수지구 보정동"];
  console.log("[NewPostPopUp] 지역 옵션 (백엔드에서 받아와야 함):", locationOptions);

  const handleSubmit = () => {
    // TODO: 백엔드로 게시물 작성 API 호출
    // POST /community/add
    // Request: { uid, title, startpoint, distance, starttime, targetpace, shortinfo }
    const postData = {
      uid: null, // TODO: AsyncStorage에서 uid 가져오기
      title: selectedLocation,
      startpoint: place,
      distance: parseInt(distance, 10),
      starttime: startTime,
      targetpace: `${paceMin}'${paceSec}"/KM`,
      shortinfo: content,
    };
    console.log("[NewPostPopUp] 게시물 작성 요청 (백엔드로 전송 필요):", postData);
    onSubmit(postData);
    handleClose();
  };

  const handleClose = () => {
    // 폼 초기화
    setSelectedLocation("수지구 죽전동");
    setPlace("");
    setStartTime("");
    setContent("");
    setDistance("5");
    setDuration("40");
    setPaceMin("6");
    setPaceSec("30");
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
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          style={styles.popupContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
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
            >
              <Text style={styles.submitButtonText}>완료</Text>
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
          >
            {/* 지역 선택 */}
            <View style={styles.section}>
              <Text style={styles.label}>지역</Text>
              <View style={styles.chipContainer}>
                {locationOptions.map((location) => (
                  <FilterChip
                    key={location}
                    label={location}
                    isActive={selectedLocation === location}
                    onPress={() => setSelectedLocation(location)}
                  />
                ))}
              </View>
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
                      style={styles.numberInputSmall}
                      placeholder="40"
                      placeholderTextColor={palette.grayPlaceholder}
                      value={duration}
                      onChangeText={setDuration}
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
        </KeyboardAvoidingView>
      </View>
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

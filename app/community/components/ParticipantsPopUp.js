import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import { palette, typography } from "@styles/globalStyles";
import apiClient from "@config/api";
import { getTierImage } from "@utils/tierImages";

const iconX = require("@assets/community/X.png");
const iconMenuSeparator = require("@assets/community/Menu_Separator.png");

export default function ParticipantsPopUp({ visible, onClose, communityId }) {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && communityId) {
      fetchParticipants();
    }
  }, [visible, communityId]);

  const fetchParticipants = async () => {
    if (!communityId) {
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: 백엔드 API 명세 확인 필요
      // 예상: POST /community/participants 또는 GET /community/{id}/participants
      // 임시로 빈 배열 표시 (백엔드 API 연동 필요)
      
      // const response = await apiClient.post("/community/participants", {
      //   communityid: Number(communityId),
      // });
      // setParticipants(response.data?.participants || []);
      
      // 임시: 빈 목록
      setParticipants([]);
    } catch (error) {
      console.error("[ParticipantsPopUp] 참가자 목록 가져오기 실패:", error);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>참가자 목록</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Image
                source={iconX}
                style={styles.closeIcon}
                tintColor={palette.white}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          
          <Image
            source={iconMenuSeparator}
            style={styles.separator}
            resizeMode="contain"
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.green} />
            </View>
          ) : participants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>참가자가 없습니다.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {participants.map((participant, index) => (
                <View key={participant.uid || index} style={styles.participantItem}>
                  <View style={styles.participantProfileCircle}>
                    {/* TODO: 프로필 이미지 */}
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.nickname || "사용자"}</Text>
                    {participant.tier && (
                      <Image
                        source={getTierImage(participant.tier)}
                        style={styles.tierImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    backgroundColor: palette.grayDark,
    borderRadius: 16,
    width: "85%",
    maxWidth: 400,
    maxHeight: "70%",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.white,
    ...typography.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  separator: {
    width: "100%",
    height: 10,
    marginBottom: 16,
    tintColor: palette.white,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.grayDark,
  },
  participantProfileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.grayMedium,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  participantName: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
    ...typography.semibold,
  },
  tierImage: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: palette.grayLight,
    ...typography.regular,
  },
});


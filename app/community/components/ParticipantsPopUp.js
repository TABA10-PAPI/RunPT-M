import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { palette, typography } from "@styles/globalStyles";
import apiClient from "@config/api";
import { getTierImage } from "@utils/tierImages";
import { useUid } from "@hooks/UseUid";

export default function ParticipantsPopUp({ visible, onClose, communityId }) {
  const { uid } = useUid();
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && communityId && uid) {
      fetchParticipants();
    }
  }, [visible, communityId, uid]);

  const fetchParticipants = async () => {
    if (!communityId || !uid) {
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await apiClient.post("/community/checkparticipate", {
        uid: Number(uid),
        communityid: Number(communityId),
      });

      if (response.data?.code === "SU" && Array.isArray(response.data.participates)) {
        setParticipants(response.data.participates);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      Alert.alert("오류", "참가자 목록을 불러오는데 실패했습니다.");
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
              <Icon name="x-circle" size={20} color={palette.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.separator} />

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
                <View key={participant.id ? `${participant.id}-${index}` : participant.uid ? `${participant.uid}-${index}` : `participant-${index}`} style={styles.participantItem}>
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
  separator: {
    flex: 17,
    borderBottomWidth: 1,
    width: "100%",
    borderBottomColor: '#E1E2E4',
    marginBottom: 16,
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


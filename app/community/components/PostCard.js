import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { palette, typography } from "@styles/globalStyles";
import { useUid } from "@hooks/UseUid";
import apiClient from "@config/api";
import { getTierImage } from "@utils/tierImages";
import { getProfileImage } from "@utils/profileImage";

/**
 * 게시물 카드 컴포넌트
 * - 게시물 정보 표시 (작성자, 장소, 시간, 거리, 페이스 등)
 * - 참가 버튼 (일반 사용자) / 참가자 확인 버튼 (작성자)
 * - 댓글 수 표시 및 상세 페이지 이동
 */
export default function PostCard({ 
  post, 
  variant = "list",
  containerStyle,
  cardStyle,
  disablePress = false,
  onShowParticipants,
  onParticipateChange
}) {
  const navigation = useNavigation();
  const { uid } = useUid();
  const [isParticipated, setIsParticipated] = useState(post.isParticipated || false);
  const [participateCount, setParticipateCount] = useState(post.participateuser || 0);
  const isAuthor = uid && post.apiData?.uid && Number(uid) === Number(post.apiData.uid);

  useEffect(() => {
    setIsParticipated(post.isParticipated ?? false);
    setParticipateCount(post.participateuser ?? 0);
  }, [post.isParticipated, post.participateuser, post.id, post.comments]);

  // 게시물 상세 페이지로 이동
  const handlePostPress = () => {
    if (!disablePress) {
      navigation.navigate("DetailPost", { post });
    }
  };

  // 참가/참가 취소 처리
  const handleParticipate = async (e) => {
    e.stopPropagation();
    
    if (!uid) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    const communityId = post.id || post.apiData?.id;
    if (!communityId) {
      Alert.alert("오류", "게시물 정보가 올바르지 않습니다.");
      return;
    }

    const uidNumber = Number(uid);
    if (isNaN(uidNumber) || uidNumber <= 0) {
      Alert.alert("오류", "유효하지 않은 사용자 정보입니다.");
      return;
    }

    try {
      const newIsParticipated = !isParticipated;
      const apiEndpoint = newIsParticipated 
        ? "/community/participate" 
        : "/community/participate/cancel";

      const requestData = {
        uid: uidNumber,
        communityid: Number(communityId),
      };

      const response = await apiClient.post(apiEndpoint, requestData);

      const responseData = response?.data || response;
      
      if (responseData.code === "SU") {
        if (onParticipateChange) {
          await onParticipateChange();
        } else {
          setIsParticipated(newIsParticipated);
          setParticipateCount(prev => 
            newIsParticipated ? prev + 1 : Math.max(0, prev - 1)
          );
        }
      } else {
        Alert.alert(
          "오류", 
          responseData.message || "참가 처리 중 문제가 발생했습니다."
        );
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "참가 처리 중 문제가 발생했습니다.";
      Alert.alert("오류", errorMessage);
    }
  };

  const isDetailView = variant === "detail";
  const CardComponent = disablePress ? View : TouchableOpacity;
  const cardProps = disablePress ? {} : { onPress: handlePostPress, activeOpacity: 0.8 };

  return (
      <View
      style={[
        styles.postContainer,
        isDetailView && styles.postContainerDetail,
        containerStyle,
      ]}
    >
      <View style={styles.postHeader}>
        <View style={styles.profileCircle}>
          <Image
            source={getProfileImage(post.apiData?.uid || post.uid || post.name)}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nickname}>{post.name}</Text>
            {post.tier && post.tier !== "UNRANKED" && (
              <Image
                source={getTierImage(post.tier)}
                style={styles.tierImage}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.location}>{post.location}</Text>
        </View>

        <View style={styles.locationTagContainer}>
          <Text style={styles.locationTag}>{post.location}</Text>
        </View>
      </View>

      <CardComponent
        style={[
          styles.card,
          isDetailView && styles.cardDetail,
          cardStyle,
        ]}
        {...cardProps}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>장소</Text>
              <Text style={styles.infoValue}>{post.place}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🕒</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>출발시간</Text>
              <Text style={styles.infoValue}>{post.startTime}</Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.description,
          isDetailView && styles.descriptionDetail
        ]}>
          {post.description || "원하는 코스 있으시면 맞추어 뛰고 싶습니다"}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>거리</Text>
            <Text style={styles.statValue}>{post.distance}</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>시간</Text>
            <Text style={styles.statValue}>{post.duration || "-"}</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>페이스</Text>
            <Text style={styles.statValue}>{post.pace}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          {isAuthor ? (
            <TouchableOpacity
                    style={[
                      styles.actionRow,
                      styles.participateButton,
                      styles.participateButtonActive
                    ]}
                  activeOpacity={0.7}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (isDetailView && onShowParticipants) {
                        onShowParticipants();
                      } else {
                        navigation.navigate("DetailPost", { post });
                      }
                    }}
                  >
                    <Text style={[
                      styles.participateText,
                      styles.participateTextActive
                    ]}>
                      {isDetailView ? "참가자 확인" : "참가자"}
                    </Text>
                    <Text style={[
                      styles.bottomText,
                      styles.participateCountActive
                    ]}>
                      {participateCount}
                    </Text>
                  </TouchableOpacity>
          ) : (
            <TouchableOpacity
                    style={[
                      styles.actionRow,
                      styles.participateButton,
                      isParticipated && styles.participateButtonActive
                    ]}
                    activeOpacity={0.7}
                    onPress={handleParticipate}
                  >
                    <Text style={[
                      styles.participateText,
                      isParticipated && styles.participateTextActive
                    ]}>
                      참가
                    </Text>
                    <Text style={[
                      styles.bottomText,
                      isParticipated && styles.participateCountActive
                    ]}>
                      {participateCount}
                    </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionRow, styles.commentRow]}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("DetailPost", { post });
            }}
          >
            <Icon name="message-circle" size={16} color={palette.grayLight} style={styles.iconComment} />
            <Text style={styles.bottomText}>{post.comments ?? 0}</Text>
          </TouchableOpacity>
          
          {isDetailView && post.timestamp && (
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          )}
        </View>
      </CardComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 20,
  },
  postContainerDetail: {
    marginBottom: 0,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.grayMedium,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nickname: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "700",
    ...typography.bold,
  },
  tierImage: {
    width: 24,
    height: 24,
    marginLeft: 6,
  },
  location: {
    color: palette.grayLight,
    fontSize: 12,
    marginTop: 4,
  },
  locationTagContainer: {
    marginLeft: "auto",
  },
  locationTag: {
    color: palette.white,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palette.gray,
    borderRadius: 12,
    fontWeight: "600",
    ...typography.semibold,
  },

  // 게시물 카드
  card: {
    backgroundColor: palette.gray,
    padding: 18,
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  infoIcon: {
    fontSize: 18,
    color: palette.red,
  },
  infoContent: {
    marginLeft: 8,
  },
  infoLabel: {
    color: palette.grayLight,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: palette.white,
    fontSize: 14,
    fontWeight: "600",
    ...typography.semibold,
  },

  // 게시물 설명
  description: {
    color: palette.grayLight,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  descriptionDetail: {
    color: palette.white,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 12,
  },
  statBlock: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: palette.green,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
    ...typography.semibold,
  },
  statValue: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "700",
    ...typography.bold,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.grayDark,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentRow: {
    marginLeft: 16,
    marginTop: 2,
  },
  iconComment: {
    marginTop: 2,
  },
  participateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.grayLight,
    backgroundColor: "transparent",
  },
  participateButtonActive: {
    backgroundColor: palette.green,
    borderColor: palette.green,
  },
  participateText: {
    color: palette.grayLight,
    fontSize: 11,
    fontWeight: "600",
    ...typography.semibold,
  },
  participateTextActive: {
    color: palette.black,
  },
  bottomText: {
    color: palette.white,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "400",
  },
  participateCountActive: {
    color: palette.black,
    fontWeight: "600",
  },
  timestamp: {
    color: palette.grayLight,
    fontSize: 12,
    marginLeft: "auto",
  },
});

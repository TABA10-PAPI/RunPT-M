import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { palette, typography } from "@styles/globalStyles";
import { useUid } from "@hooks/UseUid";
import apiClient from "@config/api";
import { getTierImage } from "@utils/tierImages";

const iconComment = require("@assets/community/comment2.png");

export default function PostCard({ 
  post, 
  variant = "list", // "list" 또는 "detail"
  containerStyle,
  cardStyle,
  disablePress = false,
  onShowParticipants // 참가자 확인 버튼 클릭 핸들러
}) {
  const navigation = useNavigation();
  const { uid } = useUid();
  const [isParticipated, setIsParticipated] = useState(post.isParticipated || false);
  const [participateCount, setParticipateCount] = useState(post.participateuser || 0);

  // 작성자 확인: post.apiData?.uid와 현재 uid 비교
  const isAuthor = uid && post.apiData?.uid && Number(uid) === Number(post.apiData.uid);

  // post가 변경될 때 참가 상태 및 인원 수 업데이트
  useEffect(() => {
    setIsParticipated(post.isParticipated || false);
    setParticipateCount(post.participateuser || 0);
  }, [post.isParticipated, post.participateuser]);

  const handlePostPress = () => {
    if (!disablePress) {
      navigation.navigate("DetailPost", { post });
    }
  };

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

      // 백엔드 API 호출
      const response = await apiClient.post(apiEndpoint, {
        uid: uidNumber,
        communityid: Number(communityId),
      });

      const responseData = response?.data || response;
      
      if (responseData.code === "SU") {
        // 성공 시 상태 업데이트
        setIsParticipated(newIsParticipated);
        setParticipateCount(prev => 
          newIsParticipated ? prev + 1 : Math.max(0, prev - 1)
        );
      } else {
        // 실패 시 에러 메시지 표시
        Alert.alert(
          "오류", 
          responseData.message || "참가 처리 중 문제가 발생했습니다."
        );
      }
    } catch (error) {
      console.error("[PostCard] 참가 오류:", error);
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
      {/* 게시자 정보 헤더 */}
      <View style={styles.postHeader}>
        {/* TODO: 프로필 이미지 추가 필요 - assets/profile_placeholder.png 또는 실제 프로필 이미지 */}
        <View style={styles.profileCircle}>
          {/* <Image 
            source={require('@assets/profile_placeholder.png')} 
            style={styles.profileImage}
            resizeMode="cover"
          /> */}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nickname}>{post.name}</Text>
            {post.tier && (
              <Image
                source={getTierImage(post.tier)}
                style={styles.tierImage}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.location}>{post.location}</Text>
        </View>

        {/* 우측 위치 태그 */}
        <View style={styles.locationTagContainer}>
          <Text style={styles.locationTag}>{post.location}</Text>
        </View>
      </View>

      {/* 게시물 카드 */}
      <CardComponent
        style={[
          styles.card,
          isDetailView && styles.cardDetail,
          cardStyle,
        ]}
        {...cardProps}
      >
        {/* 장소 및 출발시간 정보 */}
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

        {/* 게시물 설명 */}
        <Text style={[
          styles.description,
          isDetailView && styles.descriptionDetail
        ]}>
          {post.description || "원하는 코스 있으시면 맞추어 뛰고 싶습니다"}
        </Text>

        {/* 통계 정보 (거리, 시간, 페이스) */}
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

              {/* 참가 및 댓글 */}
              <View style={styles.bottomRow}>
                {isAuthor ? (
                  // 작성자일 경우: 참가자 확인 버튼 (DetailPost에서만 동작)
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
                        // DetailPost에서만 참가자 확인 기능 사용
                        onShowParticipants();
                      } else {
                        // Community.js에서는 상세 페이지로 이동
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
                  // 일반 사용자일 경우: 참가 버튼
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
            <Image
              source={iconComment}
              style={styles.iconComment}
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>{post.comments}</Text>
          </TouchableOpacity>
          
          {/* 작성 시간 (상세 페이지에서만 표시) */}
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
    marginBottom: 0, // 상세 페이지에서는 하단 마진 제거
  },

  // 게시자 정보 헤더
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.grayMedium, // TODO: 이미지 추가 후 제거 또는 투명하게 변경
    overflow: "hidden", // 이미지가 원형으로 잘리도록
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
  cardDetail: {
    // 상세 페이지에서 필요한 추가 스타일이 있다면 여기에 추가
    // 예: marginBottom: 0 등
  },

  // 장소 및 출발시간 정보
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
    color: palette.white, // 상세 페이지에서는 흰색
  },

  // 통계 정보
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

  // 좋아요 및 댓글
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
    width: 16,
    height: 16,
    tintColor: palette.grayLight,
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

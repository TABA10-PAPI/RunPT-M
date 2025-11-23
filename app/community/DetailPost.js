import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@config/api";
import { palette, typography } from "@styles/globalStyles";
import ScreenHeader from "@components/ScreenHeader";
import BottomNavigationBar from "@components/BottomNavigationBar";
import CommentItem from "./components/CommentItem";
import PostCard from "./components/PostCard";

const iconBack = require("@assets/community/arrow_left.png");
const iconSend = require("@assets/community/sendbutton.png");
const iconMenu = require("@assets/community/menu.png");
// TODO: 이미지 추가 필요
// const iconProfile = require('@assets/profile_placeholder.png'); // 프로필 사진

// Mock data - 실제로는 route.params에서 받아와야 함
const MOCK_POST = {
  id: "1",
  name: "홍길동",
  location: "수지구 죽전동",
  place: "죽전역 앞 엑스파크 공원",
  startTime: "오후 7시 30분",
  distance: "5KM",
  duration: "40Min",
  pace: "6'30\"/KM",
  likes: 5,
  comments: 9,
  description: "원하는 코스 있으시면 맞추어 뛰고 싶습니다",
  timestamp: "2025/11/27 17:19",
};

const MOCK_COMMENTS = [
  {
    id: "1",
    name: "김철수",
    comment: "저도 같이 뛰고 싶습니다!",
    timestamp: "2025/11/27 18:00",
  },
  {
    id: "2",
    name: "이영희",
    comment: "시간 맞춰서 같이 뛸 수 있을 것 같아요",
    timestamp: "2025/11/27 18:15",
  },
  {
    id: "3",
    name: "박민수",
    comment: "저도 참여하고 싶습니다",
    timestamp: "2025/11/27 18:30",
  },
  {
    id: "1",
    name: "김철수",
    comment: "저도 같이 뛰고 싶습니다!",
    timestamp: "2025/11/27 18:00",
  },
  {
    id: "1",
    name: "김철수",
    comment: "저도 같이 뛰고 싶습니다!",
    timestamp: "2025/11/27 18:00",
  },
  {
    id: "1",
    name: "김철수",
    comment: "저도 같이 뛰고 싶습니다!",
    timestamp: "2025/11/27 18:00",
  },
];

export default function DetailPost() {
  const navigation = useNavigation();
  const route = useRoute();
  const [commentText, setCommentText] = useState("");
  const [post, setPost] = useState(route.params?.post || MOCK_POST);
  const [comments, setComments] = useState(route.params?.comments || MOCK_COMMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const communityId = route.params?.post?.id || route.params?.post?.apiData?.id;

  // API 응답을 PostCard 형식으로 변환
  const transformPostData = (apiPost) => {
    return {
      id: String(apiPost.id || ""),
      name: apiPost.nickname || "사용자",
      location: apiPost.title || "",
      place: apiPost.startpoint || "",
      startTime: apiPost.starttime || "",
      distance: `${apiPost.distance || 0}KM`,
      duration: "",
      pace: apiPost.targetpace || "",
      likes: 0,
      comments: apiPost.comments?.length || 0,
      description: apiPost.shortinfo || "",
      timestamp: apiPost.createAt || "",
      apiData: apiPost,
    };
  };

  // 댓글 데이터 변환
  const transformCommentData = (apiComment) => {
    return {
      id: String(apiComment.id || ""),
      name: apiComment.nickname || "사용자",
      comment: apiComment.content || "",
      timestamp: apiComment.createAt
        ? new Date(apiComment.createAt)
            .toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
            .replace(/\./g, "/")
            .replace(/,/g, "")
        : "",
    };
  };

  // 게시물 상세 정보 가져오기
  const fetchPostDetail = async () => {
    if (!communityId) {
      console.log("[DetailPost] communityId가 없어서 상세 정보를 가져올 수 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      // GET /community/detail?communityid={communityid}
      const response = await apiClient.get("/community/detail", {
        params: { communityid: parseInt(communityId, 10) },
      });

      console.log("[DetailPost] 게시물 상세 정보 응답:", response.data);

      const apiPost = response.data;
      const transformedPost = transformPostData(apiPost);
      setPost(transformedPost);

      // 댓글 목록 변환
      if (Array.isArray(apiPost.comments)) {
        const transformedComments = apiPost.comments.map(transformCommentData);
        setComments(transformedComments);
      }
    } catch (error) {
      console.error("[DetailPost] 게시물 상세 정보 가져오기 실패:", error);
      Alert.alert("오류", "게시물을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchPostDetail();
    }
  }, [communityId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    if (!communityId) {
      Alert.alert("오류", "게시물 정보가 없습니다.");
      return;
    }

    try {
      setIsSubmittingComment(true);
      const uid = await AsyncStorage.getItem("uid");
      if (!uid) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      // POST /community/comment
      const response = await apiClient.post("/community/comment", {
        communityid: parseInt(communityId, 10),
        uid: parseInt(uid, 10),
        content: commentText.trim(),
      });

      console.log("[DetailPost] 댓글 작성 응답:", response.data);

      // 응답 데이터를 댓글 형식으로 변환
      const newComment = transformCommentData(response.data);
      setComments([...comments, newComment]);
      setCommentText("");

      // 게시물 상세 정보 새로고침 (댓글 수 업데이트)
      await fetchPostDetail();
    } catch (error) {
      console.error("[DetailPost] 댓글 작성 실패:", error);
      Alert.alert("오류", error.response?.data?.message || "댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.headerContainer}>
            <ScreenHeader
              title="Community"
              leftContent={
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <Image
                    source={iconBack}
                    style={styles.backIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              }
              rightContent={
                <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                  <Image
                    source={iconMenu}
                    style={styles.menuIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.green} />
            </View>
          ) : (
            <>
              <PostCard post={post} variant="detail" disablePress={true} />
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 댓글 섹션 */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsHeader}>댓글 {comments.length}</Text>
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          {/* 댓글 입력 */}
          <View style={styles.commentInputContainer}>
            <View style={styles.commentInputBox}>
              <View style={styles.inputProfileCircle}>
                {/* TODO: 프로필 이미지 추가 필요 */}
                {/* <Image
                  source={require('@assets/profile_placeholder.png')}
                  style={styles.inputProfileImage}
                  resizeMode="cover"
                /> */}
              </View>
              <TextInput
                placeholder={`${post.name} 님에게 댓글`}
                placeholderTextColor={palette.grayPlaceholder}
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                activeOpacity={0.7}
                disabled={isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color={palette.green} />
                ) : (
                  <Image
                    source={iconSend}
                    style={styles.sendIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <BottomNavigationBar navigation={navigation} currentRoute="Community" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.black,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: palette.black,
  },
  headerContainer: {
    marginTop: 8,
    marginBottom: 16,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: palette.white,
  },
  backText: {
    fontSize: 24,
    color: palette.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.white,
    letterSpacing: 0.4,
    ...typography.bold,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: palette.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  trophyIcon: {
    fontSize: 16,
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
  postContent: {
    backgroundColor: palette.gray,
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
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
  description: {
    color: palette.grayLight,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
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
  },
  iconThumb: {
    width: 17,
    height: 19,
  },
  iconComment: {
    width: 16,
    height: 16,
  },
  bottomText: {
    color: palette.white,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "400",
  },
  timestamp: {
    color: palette.grayLight,
    fontSize: 12,
    marginLeft: "auto",
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentsHeader: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    ...typography.bold,
  },
  commentInputContainer: {
    paddingVertical: 12,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: palette.grayDark,
  },
  commentInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.gray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  inputProfileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.grayMedium,
    overflow: "hidden",
    marginRight: 12,
  },
  inputProfileImage: {
    width: "100%",
    height: "100%",
  },
  commentInput: {
    flex: 1,
    color: palette.white,
    fontSize: 14,
    maxHeight: 100,
    padding: 0,
    paddingVertical: 8,
  },
  submitButton: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    width: 32,
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

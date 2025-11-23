import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
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
  
  // TODO: 백엔드에서 게시물 상세 정보 받아오기
  // GET /community/detail?communityid={communityid}
  // Response: { id, uid, startpoint, distance, starttime, targetpace, shortinfo, createAt, comments, nickname, tier }
  const post = route.params?.post || MOCK_POST;
  console.log("[DetailPost] 게시물 상세 정보 (백엔드에서 받아와야 함):", post);

  // TODO: 백엔드에서 댓글 목록 받아오기
  // GET /community/detail?communityid={communityid}의 comments 필드
  // Response comments: [{ id, communityid, uid, content, createAt, nickname, tier }]
  const [comments, setComments] = useState(
    route.params?.comments || MOCK_COMMENTS
  );
  console.log("[DetailPost] 댓글 목록 (백엔드에서 받아와야 함):", comments);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmitComment = (post) => {
    if (commentText.trim()) {
      // TODO: 백엔드로 댓글 작성 API 호출
      // POST /community/comment
      // Request: { communityid, uid, content }
      // Response: { content, createAt, nickname, tier }
      console.log("[DetailPost] 댓글 작성 요청 (백엔드로 전송 필요):", {
        communityid: post.id,
        content: commentText,
      });
      
      // 임시: API 응답 대기 중이므로 로컬 상태 업데이트
      const newComment = {
        id: String(comments.length + 1),
        name: "사용자",
        comment: commentText,
        timestamp: new Date()
          .toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/\./g, "/")
          .replace(/,/g, ""),
      };
      setComments([...comments, newComment]);
      setCommentText("");
      console.log("[DetailPost] 댓글 작성 후 UI 업데이트 (백엔드 응답 후 실제 데이터로 교체 필요)");
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
              >
                <Image
                  source={iconSend}
                  style={styles.sendIcon}
                  resizeMode="contain"
                />
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
});

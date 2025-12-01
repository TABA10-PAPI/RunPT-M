import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import apiClient from "@config/api";
import { useUid } from "@hooks/UseUid";
import { palette, typography } from "@styles/globalStyles";
import ScreenHeader from "@components/ScreenHeader";
import BottomNavigationBar from "@components/BottomNavigationBar";
import CommentItem from "./components/CommentItem";
import PostCard from "./components/PostCard";
import PostMenuPopUp from "./components/PostMenuPopUp";
import EditPostPopUp from "./components/EditPostPopUp";
import DeleteConfirmPopUp from "./components/DeleteConfirmPopUp";
import ParticipantsPopUp from "./components/ParticipantsPopUp";
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
  const { uid } = useUid();
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState("");
  const [post, setPost] = useState(route.params?.post || MOCK_POST);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // 팝업 상태 관리
  const [isMenuPopupVisible, setIsMenuPopupVisible] = useState(false);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isParticipantsPopupVisible, setIsParticipantsPopupVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isCommentDeleteConfirmVisible, setIsCommentDeleteConfirmVisible] = useState(false);

  const communityId = route.params?.post?.id || route.params?.post?.apiData?.id;
  
  // 게시글 작성자 확인
  const [isAuthor, setIsAuthor] = useState(false);
  
  useEffect(() => {
    if (uid && post?.apiData?.uid) {
      const authorUid = Number(post.apiData.uid);
      const currentUid = Number(uid);
      setIsAuthor(authorUid === currentUid);
    } else {
      setIsAuthor(false);
    }
  }, [uid, post?.apiData?.uid, post?.id]);
  
  // BottomNavigationBar 높이 계산
  const bottomNavBarHeight = 68 + insets.bottom;

  // 키보드 show/hide 이벤트 처리
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  // 페이스 문자열을 파싱하여 분 단위로 변환
  // 지원 형식: "6'30"", "6'30", "5:30", "5:30초"
  const parsePaceToMinutes = (paceString) => {
    if (!paceString || typeof paceString !== "string") {
      return 0;
    }
    
    // "6'30"" 또는 "6'30" 형식 파싱 (예: 6'30")
    let match = paceString.match(/(\d+)'(\d+)"/);
    if (match) {
      const minutes = Number(match[1]) || 0;
      const seconds = Number(match[2]) || 0;
      return minutes + seconds / 60;
    }
    
    // "6'30" 형식 파싱 (따옴표 없음)
    match = paceString.match(/(\d+)'(\d+)/);
    if (match) {
      const minutes = Number(match[1]) || 0;
      const seconds = Number(match[2]) || 0;
      return minutes + seconds / 60;
    }
    
    // "5:30" 또는 "5:30초" 형식 파싱
    match = paceString.match(/(\d+):(\d+)/);
    if (match) {
      const minutes = Number(match[1]) || 0;
      const seconds = Number(match[2]) || 0;
      return minutes + seconds / 60;
    }
    
    return 0;
  };

  // 거리와 페이스로부터 예상 소요시간 계산 (분)
  const calculateDuration = (distance, pace) => {
    const distanceNum = Number(distance) || 0;
    const paceInMinutes = parsePaceToMinutes(pace);
    
    if (distanceNum <= 0 || paceInMinutes <= 0) {
      return "";
    }
    
    const totalMinutes = distanceNum * paceInMinutes;
    return `${Math.round(totalMinutes)}분`;
  };

  // 현재 사용자의 참가 여부 확인
  const checkUserParticipation = async (communityId, currentUid) => {
    if (!communityId || !currentUid) {
      return false;
    }

    try {
      const response = await apiClient.post("/community/checkparticipate", {
        uid: Number(currentUid),
        communityid: Number(communityId),
      });

      if (response.data?.code === "SU" && Array.isArray(response.data.participates)) {
        // 참가자 목록에서 현재 uid가 있는지 확인
        return response.data.participates.some(
          (participant) => Number(participant.uid) === Number(currentUid)
        );
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // API 응답을 PostCard 형식으로 변환
  const transformPostData = async (apiPost) => {
    const distance = apiPost.distance || 0;
    const pace = apiPost.targetpace || "";
    const duration = calculateDuration(distance, pace);

    // 댓글 개수 계산
    let commentCount = 0;
    if (Array.isArray(apiPost.comments)) {
      commentCount = apiPost.comments.length;
    } else if (apiPost.commentCount !== undefined) {
      commentCount = Number(apiPost.commentCount) || 0;
    } else if (apiPost.comments !== undefined) {
      commentCount = Number(apiPost.comments) || 0;
    }

    // 참가 여부 확인
    const isParticipated = await checkUserParticipation(apiPost.id, uid);

    return {
      id: String(apiPost.id || ""),
      name: apiPost.nickname || "사용자",
      location: apiPost.title || "",
      place: apiPost.startpoint || "",
      startTime: apiPost.starttime || "",
      distance: `${distance}KM`,
      duration: duration,
      pace: pace,
      likes: 0,
      comments: commentCount,
      description: apiPost.shortinfo || "",
      timestamp: apiPost.createAt || "",
      tier: apiPost.tier || "UNRANKED",
      participateuser: apiPost.participateuser || 0,
      isParticipated: isParticipated,
      apiData: apiPost,
    };
  };

  // 댓글 데이터 변환
  const transformCommentData = (apiComment) => {
    return {
      id: String(apiComment.id || ""),
      name: apiComment.nickname || "사용자",
      comment: apiComment.content || "",
      tier: apiComment.tier || "UNRANKED",
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
      apiData: apiComment,
    };
  };

  // 게시물 상세 정보 가져오기
  const fetchPostDetail = async () => {
    if (!communityId) {
      return;
    }

    try {
      setIsLoading(true);
      // POST /community/detail
      const response = await apiClient.post("/community/detail", {
        id: Number(communityId),
      });

      const apiPost = response.data;
      
      // 댓글 목록 변환
      const transformedComments = Array.isArray(apiPost.comments)
        ? apiPost.comments.map(transformCommentData)
        : [];
      setComments(transformedComments);
      
      // 게시물 데이터 변환
      const transformedPost = await transformPostData(apiPost);
      transformedPost.comments = transformedComments.length;
      transformedPost.participateuser = apiPost.participateuser || 0;
      setPost(transformedPost);
    } catch (error) {
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

  // uid가 변경될 때 게시물 정보 다시 가져오기
  useEffect(() => {
    if (uid && communityId) {
      fetchPostDetail();
    }
  }, [uid]);

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

    if (!uid) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    try {
      setIsSubmittingComment(true);

      // POST /community/comment
      await apiClient.post("/community/comment", {
        communityid: Number(communityId),
        uid: Number(uid),
        content: commentText.trim(),
      });

      setCommentText("");
      await fetchPostDetail();
    } catch (error) {
      Alert.alert("오류", error.response?.data?.message || "댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 게시물 삭제
  const handleDeletePost = async () => {
    if (!uid || !communityId) {
      Alert.alert("오류", "삭제할 수 없습니다.");
      return;
    }

    try {
      await apiClient.post("/community/delete", {
        uid: Number(uid),
        id: Number(communityId),
      });
      
      Alert.alert("완료", "게시물이 삭제되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("오류", error.response?.data?.message || "게시물 삭제에 실패했습니다.");
    }
  };

  // 게시물 수정 완료
  const handleEditPostComplete = async () => {
    await fetchPostDetail();
    setIsEditPopupVisible(false);
  };

  // 댓글 작성자인지 확인하는 헬퍼 함수
  const isCommentAuthor = (comment) => {
    if (!uid || !comment?.apiData?.uid) {
      return false;
    }
    return Number(uid) === Number(comment.apiData.uid);
  };

  // 댓글 삭제
  const handleDeleteComment = async () => {
    if (!commentToDelete || !uid || !communityId) {
      return;
    }

    try {
      await apiClient.post("/community/comment/delete", {
        uid: Number(uid),
        communityid: Number(communityId),
        commentid: Number(commentToDelete.id),
      });
      
      await fetchPostDetail();
      setCommentToDelete(null);
      setIsCommentDeleteConfirmVisible(false);
    } catch (error) {
      Alert.alert("오류", error.response?.data?.message || "댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
                  <Icon name="arrow-left" size={24} color={palette.white} />
                </TouchableOpacity>
              }
              rightContent={
                isAuthor ? (
                  <TouchableOpacity
                    style={styles.menuButton}
                    activeOpacity={0.7}
                    onPress={() => setIsMenuPopupVisible(true)}
                  >
                    <Icon name="menu" size={24} color={palette.white} />
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.green} />
            </View>
          ) : (
            <View style={styles.contentWrapper}>
              {post && (
                <PostCard
                  post={post}
                  variant="detail"
                  disablePress={true}
                  onShowParticipants={() => setIsParticipantsPopupVisible(true)}
                  onParticipateChange={async () => {
                    await fetchPostDetail();
                  }}
                />
              )}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* 댓글 섹션 */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsHeader}>댓글 {comments.length}</Text>
                  {comments.map((comment, index) => (
                    <CommentItem
                      key={comment.id ? `${comment.id}-${index}` : `comment-${index}`}
                      comment={comment}
                      canDelete={isCommentAuthor(comment)}
                      onDelete={(comment) => {
                        setCommentToDelete(comment);
                        setIsCommentDeleteConfirmVisible(true);
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* 댓글 입력 */}
          {!isLoading && (
            <View style={[
              styles.commentInputContainer, 
              { 
                paddingBottom: keyboardHeight > 0 ? 10 : bottomNavBarHeight,
              }
            ]}>
            <View style={styles.commentInputBox}>
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
                  <Icon name="send" size={24} color={palette.green} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <BottomNavigationBar navigation={navigation} currentRoute="Community" />
      
      {/* 게시물 메뉴 팝업 */}
      <PostMenuPopUp
        visible={isMenuPopupVisible}
        onClose={() => setIsMenuPopupVisible(false)}
        onEdit={() => setIsEditPopupVisible(true)}
        onDelete={() => setIsDeleteConfirmVisible(true)}
      />

      {/* 게시물 수정 팝업 */}
      <EditPostPopUp
        visible={isEditPopupVisible}
        onClose={() => setIsEditPopupVisible(false)}
        onSubmit={handleEditPostComplete}
        post={post}
      />

      {/* 게시물 삭제 확인 팝업 */}
      <DeleteConfirmPopUp
        visible={isDeleteConfirmVisible}
        onClose={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleDeletePost}
        title="게시물을 삭제하시겠습니까?"
        message="삭제된 게시물은 복구할 수 없습니다."
      />

      {/* 댓글 삭제 확인 팝업 */}
      <DeleteConfirmPopUp
        visible={isCommentDeleteConfirmVisible}
        onClose={() => {
          setIsCommentDeleteConfirmVisible(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        title="댓글을 삭제하시겠습니까?"
        message="삭제된 댓글은 복구할 수 없습니다."
      />

      {/* 참가자 목록 팝업 */}
      <ParticipantsPopUp
        visible={isParticipantsPopupVisible}
        onClose={() => setIsParticipantsPopupVisible(false)}
        communityId={communityId}
      />
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
  contentWrapper: {
    flex: 1,
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
    borderTopWidth: 1,
    borderTopColor: palette.grayDark,
    backgroundColor: palette.black,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

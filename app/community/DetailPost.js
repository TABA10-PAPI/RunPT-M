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

/**
 * 게시물 상세 화면
 * - 게시물 상세 정보 표시
 * - 댓글 목록 및 댓글 작성 기능
 * - 게시물 수정/삭제 기능 (작성자만)
 * - 참가자 목록 확인 기능
 */
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
  const [isMenuPopupVisible, setIsMenuPopupVisible] = useState(false);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isParticipantsPopupVisible, setIsParticipantsPopupVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isCommentDeleteConfirmVisible, setIsCommentDeleteConfirmVisible] = useState(false);

  const communityId = route.params?.post?.id || route.params?.post?.apiData?.id;
  const [isAuthor, setIsAuthor] = useState(false);
  
  useEffect(() => {
    if (uid && post?.apiData?.uid) {
      const authorUid = Number(post.apiData.uid);
      const currentUid = Number(uid);
      setIsAuthor(authorUid === currentUid);
    } else {
      setIsAuthor(false);
    }
  }, [uid, post?.apiData?.uid, post?.id, post]);
  
  const bottomNavBarHeight = 68 + insets.bottom;

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

  // 페이스 문자열을 분 단위로 변환
  const parsePaceToMinutes = (paceString) => {
    if (!paceString || typeof paceString !== "string") {
      return 0;
    }
    
    let match = paceString.match(/(\d+)'(\d+)"/);
    if (match) {
      const minutes = Number(match[1]) || 0;
      const seconds = Number(match[2]) || 0;
      return minutes + seconds / 60;
    }
    
    match = paceString.match(/(\d+)'(\d+)/);
    if (match) {
      const minutes = Number(match[1]) || 0;
      const seconds = Number(match[2]) || 0;
      return minutes + seconds / 60;
    }
    
    match = paceString.match(/(\d+):(\d+)/);
    if (match) {
      const minutes = Number(match[1]) || 0;
      const seconds = Number(match[2]) || 0;
      return minutes + seconds / 60;
    }
    
    return 0;
  };

  // 거리와 페이스로부터 예상 소요시간 계산
  const calculateDuration = (distance, pace) => {
    const distanceNum = Number(distance) || 0;
    const paceInMinutes = parsePaceToMinutes(pace);
    
    if (distanceNum <= 0 || paceInMinutes <= 0) {
      return "";
    }
    
    const totalMinutes = distanceNum * paceInMinutes;
    return `${Math.round(totalMinutes)}분`;
  };

  // 현재 사용자의 게시물 참가 여부 확인
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
        return response.data.participates.some(
          (participant) => Number(participant.uid) === Number(currentUid)
        );
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // API 응답 데이터를 PostCard 형식으로 변환
  const transformPostData = async (apiPost) => {
    const distance = apiPost.distance || 0;
    const pace = apiPost.targetpace || "";
    const duration = calculateDuration(distance, pace);
    const commentCount = Number(apiPost.commentCount) || 0;
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
      timestamp: apiPost.createAt
        ? new Date(apiPost.createAt)
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
      tier: apiPost.tier || "UNRANKED",
      participateuser: apiPost.participateuser || 0,
      isParticipated: isParticipated,
      apiData: apiPost,
    };
  };

  // 댓글 API 응답 데이터를 CommentItem 형식으로 변환
  const transformCommentData = (apiComment) => {
    return {
      id: String(apiComment.id || ""),
      name: apiComment.nickname || "사용자",
      comment: apiComment.content || "",
      tier: apiComment.tier || null,
      uid: apiComment.uid || null,
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
      const response = await apiClient.post("/community/detail", {
        id: Number(communityId),
      });

      const apiPost = response.data;
      const transformedComments = Array.isArray(apiPost.comments)
        ? apiPost.comments.map(transformCommentData)
        : [];
      setComments(transformedComments);
      
      const transformedPost = await transformPostData(apiPost);
      transformedPost.comments = Number(apiPost.commentCount) || transformedComments.length;
      transformedPost.participateuser = apiPost.participateuser || 0;
      setPost(transformedPost);
      
      // 작성자 여부 다시 확인
      if (uid && apiPost.uid) {
        const authorUid = Number(apiPost.uid);
        const currentUid = Number(uid);
        setIsAuthor(authorUid === currentUid);
      } else {
        setIsAuthor(false);
      }
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

  useEffect(() => {
    if (uid && communityId) {
      fetchPostDetail();
    }
  }, [uid]);

  const handleBack = () => {
    navigation.goBack();
  };

  // 댓글 작성
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

  const handleEditPostComplete = async () => {
    await fetchPostDetail();
    setIsEditPopupVisible(false);
  };

  // 댓글 작성자인지 확인
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
                isAuthor && uid ? (
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
      
      <PostMenuPopUp
        visible={isMenuPopupVisible}
        onClose={() => setIsMenuPopupVisible(false)}
        onEdit={() => setIsEditPopupVisible(true)}
        onDelete={() => setIsDeleteConfirmVisible(true)}
      />

      <EditPostPopUp
        visible={isEditPopupVisible}
        onClose={() => setIsEditPopupVisible(false)}
        onSubmit={handleEditPostComplete}
        post={post}
      />

      <DeleteConfirmPopUp
        visible={isDeleteConfirmVisible}
        onClose={() => setIsDeleteConfirmVisible(false)}
        onConfirm={handleDeletePost}
        title="게시물을 삭제하시겠습니까?"
        message="삭제된 게시물은 복구할 수 없습니다."
      />

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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
  commentInput: {
    flex: 1,
    color: palette.white,
    fontSize: 14,
    maxHeight: 100,
    padding: 0,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});


import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
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

const iconThumb = require("@assets/thumbs_up.png");
const iconComment = require("@assets/comments.png");
const back_arrow = require("@assets/arrow_left.png");
const send_button = require("@assets/sendbutton.png");
// TODO: 이미지 추가 필요
// const iconBack = require('@assets/back_arrow.png'); // 뒤로가기 아이콘
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
];

export default function DetailPost() {
  const navigation = useNavigation();
  const route = useRoute();
  const [commentText, setCommentText] = useState("");

  // route.params에서 post 데이터 받아오기 (실제 구현 시)
  const post = route.params?.post || MOCK_POST;
  const comments = route.params?.comments || MOCK_COMMENTS;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      // TODO: 댓글 작성 API 호출
      console.log("댓글 작성:", commentText);
      setCommentText("");
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentProfileCircle}>
        {/* TODO: 프로필 이미지 추가 필요 */}
        {/* <Image
          source={require('@assets/profile_placeholder.png')}
          style={styles.commentProfileImage}
          resizeMode="cover"
        /> */}
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.name}</Text>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    </View>
  );

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
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Image
                  source={back_arrow}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Community</Text>
              <View style={styles.headerRight} />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 게시자 정보 헤더 */}
            <View style={styles.postHeader}>
              <View style={styles.profileCircle}>
                {/* TODO: 프로필 이미지 추가 필요 */}
                {/* <Image
                  source={require('@assets/profile_placeholder.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                /> */}
              </View>

              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.nickname}>{post.name}</Text>
                  <Text style={styles.trophyIcon}>🏆</Text>
                </View>
                <Text style={styles.location}>{post.location}</Text>
              </View>

              <View style={styles.locationTagContainer}>
                <Text style={styles.locationTag}>{post.location}</Text>
              </View>
            </View>

            {/* 게시물 내용 */}
            <View style={styles.postContent}>
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

              <Text style={styles.description}>{post.description}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>거리</Text>
                  <Text style={styles.statValue}>{post.distance}</Text>
                </View>

                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>시간</Text>
                  <Text style={styles.statValue}>{post.duration}</Text>
                </View>

                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>페이스</Text>
                  <Text style={styles.statValue}>{post.pace}</Text>
                </View>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.actionRow}>
                  <Image
                    source={iconThumb}
                    style={styles.iconThumb}
                    resizeMode="contain"
                  />
                  <Text style={styles.bottomText}>{post.likes}</Text>
                </View>

                <View style={[styles.actionRow, styles.commentRow]}>
                  <Image
                    source={iconComment}
                    style={styles.iconComment}
                    resizeMode="contain"
                  />
                  <Text style={styles.bottomText}>{post.comments}</Text>
                </View>

                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>

            {/* 댓글 섹션 */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsHeader}>댓글 {comments.length}</Text>
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderComment}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>

          {/* 댓글 입력 */}
          <View style={styles.commentInputContainer}>
            <View style={styles.commentInputBox}>
              <TextInput
                placeholder="댓글을 입력하세요"
                placeholderTextColor="#666"
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitComment}
                activeOpacity={0.7}
              >
                <Image source={send_button}></Image>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
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
  headerRight: {
    position: "absolute",
    right: 0,
    width: 40,
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
    backgroundColor: "#555",
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
    color: "#999",
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
    color: "#999",
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
    color: "#999",
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
    borderTopColor: "#333",
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
    color: "#999",
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
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentProfileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#555",
    overflow: "hidden",
    marginRight: 12,
  },
  commentProfileImage: {
    width: "100%",
    height: "100%",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentName: {
    color: palette.white,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
    ...typography.semibold,
  },
  commentTimestamp: {
    color: "#999",
    fontSize: 12,
  },
  commentText: {
    color: "#999",
    fontSize: 13,
    lineHeight: 18,
  },
  commentInputContainer: {
    paddingVertical: 12,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  commentInputBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: palette.gray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  commentInput: {
    flex: 1,
    color: palette.white,
    fontSize: 14,
    maxHeight: 100,
    padding: 0,
  },
  submitButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: palette.green,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: palette.black,
    fontSize: 14,
    fontWeight: "600",
    ...typography.semibold,
  },
});

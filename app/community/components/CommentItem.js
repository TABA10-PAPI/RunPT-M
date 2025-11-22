import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { palette, typography } from "@styles/globalStyles";

// TODO: 이미지 추가 필요
// const iconProfile = require('@assets/profile_placeholder.png'); // 프로필 사진

export default function CommentItem({ comment }) {
  return (
    <View style={styles.commentWrapper}>
      {/* 위쪽 구분선 */}
      <View style={styles.divider} />
      
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
            <Text style={styles.commentName}>{comment.name}</Text>
            <Text style={styles.trophyIcon}>🏆</Text>
            <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
          </View>
          <Text style={styles.commentText}>{comment.comment}</Text>
        </View>
      </View>
      
      {/* 아래쪽 구분선 */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  commentWrapper: {
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    width: "100%",
  },
  commentItem: {
    flexDirection: "row",
    paddingVertical: 16,
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
    marginRight: 6,
    ...typography.semibold,
  },
  trophyIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  commentTimestamp: {
    color: "#999",
    fontSize: 12,
    marginLeft: "auto",
  },
  commentText: {
    color: "#999",
    fontSize: 13,
    lineHeight: 18,
  },
});



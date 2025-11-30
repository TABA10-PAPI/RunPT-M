import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { palette, typography } from "@styles/globalStyles";
import { getTierImage } from "@utils/tierImages";

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
            {comment.tier && (
              <Image
                source={getTierImage(comment.tier)}
                style={styles.tierImage}
                resizeMode="contain"
              />
            )}
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
    backgroundColor: palette.grayDark,
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
    backgroundColor: palette.grayMedium,
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
  tierImage: {
    width: 20,
    height: 20,
    marginLeft: 6,
  },
  commentTimestamp: {
    color: palette.grayLight,
    fontSize: 12,
    marginLeft: "auto",
  },
  commentText: {
    color: palette.grayLight,
    fontSize: 13,
    lineHeight: 18,
  },
});



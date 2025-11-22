import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { palette, typography } from '@styles/globalStyles';

const iconThumb = require('@assets/thumbs_up.png');
const iconComment = require('@assets/comments.png');

export default function PostCard({ post }) {
  return (
    <View style={styles.postContainer}>
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
            <Text style={styles.trophyIcon}>🏆</Text>  {/*티어 아이콘*/}
          </View>
          <Text style={styles.location}>{post.location}</Text>
        </View>

        {/* 우측 위치 태그 */}
        <View style={styles.locationTagContainer}>
          <Text style={styles.locationTag}>{post.location}</Text>
        </View>
      </View>

      {/* 게시물 카드 */}
      <View style={styles.card}>
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
        <Text style={styles.description}>
          {post.description || '원하는 코스 있으시면 맞추어 뛰고 싶습니다'}
        </Text>

        {/* 통계 정보 (거리, 시간, 페이스) */}
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

        {/* 좋아요 및 댓글 */}
        <View style={styles.bottomRow}>
          <View style={styles.actionRow}>
            <Image 
              source={iconThumb} 
              style={styles.iconSmall} 
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>{post.likes}</Text>
          </View>

          <View style={[styles.actionRow, styles.commentRow]}>
            <Image 
              source={iconComment} 
              style={styles.iconSmall} 
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>{post.comments}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: { 
    marginBottom: 20 
  },

  // 게시자 정보 헤더
  postHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  profileCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: '#555', // TODO: 이미지 추가 후 제거 또는 투명하게 변경
    overflow: 'hidden', // 이미지가 원형으로 잘리도록
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    marginLeft: 12, 
    flex: 1 
  },
  nameRow: {
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  nickname: { 
    color: palette.white, 
    fontSize: 16,
    fontWeight: '700',
    ...typography.bold 
  },
  trophyIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  location: { 
    color: '#999', 
    fontSize: 12, 
    marginTop: 4 
  },
  locationTagContainer: {
    marginLeft: 'auto',
  },
  locationTag: {
    color: palette.white,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palette.gray,
    borderRadius: 12,
    fontWeight: '600',
    ...typography.semibold,
  },

  // 게시물 카드
  card: {
    backgroundColor: palette.gray,
    padding: 18,
    borderRadius: 16,
  },

  // 장소 및 출발시간 정보
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    ...typography.semibold,
  },

  // 게시물 설명
  description: {
    color: '#999',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },

  // 통계 정보
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: palette.green,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
    ...typography.semibold,
  },
  statValue: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
    ...typography.bold,
  },

  // 좋아요 및 댓글
  bottomRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  commentRow: {
    marginLeft: 16,
  },
  iconSmall: { 
    width: 20, 
    height: 20,
  },
  bottomText: { 
    color: palette.white, 
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '400',
  },
});


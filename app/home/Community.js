import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, typography } from '../../styles/globalStyles';

const iconThumb = require('../../assets/thumbs_up.png');
const iconComment = require('../../assets/comments.png');
const iconNewPost = require('../../assets/new_post.png');

// TODO: 이미지 추가 필요
// const iconSearch = require('../../assets/search_icon.png'); // 검색 아이콘
// const iconProfile = require('../../assets/profile_placeholder.png'); // 프로필 사진
// const iconNavRunning = require('../../assets/nav_running.png'); // 하단 네비게이션 - 러닝 아이콘
// const iconNavBattery = require('../../assets/nav_battery.png'); // 하단 네비게이션 - 배터리 아이콘
// const iconNavHome = require('../../assets/nav_home.png'); // 하단 네비게이션 - 홈 아이콘
// const iconNavHandshake = require('../../assets/nav_handshake.png'); // 하단 네비게이션 - 악수 아이콘
// const iconNavPerson = require('../../assets/nav_person.png'); // 하단 네비게이션 - 사람 아이콘

const MOCK_POSTS = [
  {
    id: '1',
    name: '홍길동',
    location: '수지구 죽전동',
    place: '죽전역 앞 엑스파크 공원',
    startTime: '오후 7시 30분',
    distance: '5KM',
    duration: '40Min',
    pace: "6'30\"/KM",
    likes: 5,
    comments: 9,
  },
  {
    id: '2',
    name: '홍길동',
    location: '수지구 죽전동',
    place: '죽전역 앞 엑스파크 공원',
    startTime: '오후 7시 30분',
    distance: '5KM',
    duration: '40Min',
    pace: "6'30\"/KM",
    likes: 5,
    comments: 9,
  },
];

export default function CommunityScreen() {
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>

      <View style={styles.postHeader}>
        {/* TODO: 프로필 이미지 추가 필요 - assets/profile_placeholder.png 또는 실제 프로필 이미지 */}
        <View style={styles.profileCircle}>
          {/* <Image 
            source={require('../../assets/profile_placeholder.png')} 
            style={styles.profileImage}
            resizeMode="cover"
          /> */}
        </View>

        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.nickname}>{item.name}</Text>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <Text style={styles.location}>{item.location}</Text>
        </View>

        <View style={{ marginLeft: 'auto' }}>
          <Text style={styles.locationTag}>{item.location}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoLabel}>장소</Text>
              <Text style={styles.infoValue}>{item.place}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🕒</Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoLabel}>출발시간</Text>
              <Text style={styles.infoValue}>{item.startTime}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>
          원하는 코스 있으시면 맞추어 뛰고 싶습니다
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>거리</Text>
            <Text style={styles.statValue}>{item.distance}</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>시간</Text>
            <Text style={styles.statValue}>{item.duration}</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>페이스</Text>
            <Text style={styles.statValue}>{item.pace}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.row}>
            <Image 
              source={iconThumb} 
              style={styles.iconSmall} 
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>{item.likes}</Text>
          </View>

          <View style={[styles.row, { marginLeft: 16 }]}>
            <Image 
              source={iconComment} 
              style={styles.iconSmall} 
              resizeMode="contain"
            />
            <Text style={styles.bottomText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.headerText}>Community</Text>

          <TouchableOpacity style={styles.newPostButton}>
            <Image source={iconNewPost} style={styles.newPostIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="제목, 작성자, 내용을 검색하세요"
              placeholderTextColor="#666"
              style={styles.searchInput}
            />
            {/* TODO: 검색 아이콘 이미지 추가 필요 - assets/search_icon.png */}
            <View style={styles.searchIconContainer}>
              {/* <Image 
                source={require('../../assets/search_icon.png')} 
                style={styles.searchIconImage}
                resizeMode="contain"
              /> */}
              <Text style={styles.searchIcon}>🔍</Text>
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>지역</Text>

          <TouchableOpacity style={styles.filterChipActive}>
            <Text style={styles.filterChipTextActive}>수지구 죽전동</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>수지구 보정동</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_POSTS}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* TODO: 하단 네비게이션 바 - 이미지 추가 필요
          필요한 이미지 파일:
          - assets/nav_running.png (러닝 아이콘 - 활성화 상태, 노란색)
          - assets/nav_battery.png (배터리 아이콘)
          - assets/nav_home.png (홈 아이콘)
          - assets/nav_handshake.png (악수 아이콘 - 활성화 상태, 노란색)
          - assets/nav_person.png (사람 아이콘)
        */}
        <View style={styles.bottomNavBar}>
          <TouchableOpacity style={styles.navItem}>
            {/* TODO: 이미지 추가 - assets/nav_running.png (활성화 상태, 노란색) */}
            {/* <Image 
              source={require('../../assets/nav_running.png')} 
              style={[styles.navIcon, styles.navIconActive]}
              resizeMode="contain"
            /> */}
            <View style={[styles.navIconPlaceholder, { backgroundColor: palette.yellow }]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            {/* TODO: 이미지 추가 - assets/nav_battery.png */}
            {/* <Image 
              source={require('../../assets/nav_battery.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            /> */}
            <View style={styles.navIconPlaceholder} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            {/* TODO: 이미지 추가 - assets/nav_home.png */}
            {/* <Image 
              source={require('../../assets/nav_home.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            /> */}
            <View style={styles.navIconPlaceholder} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            {/* TODO: 이미지 추가 - assets/nav_handshake.png (활성화 상태, 노란색) */}
            {/* <Image 
              source={require('../../assets/nav_handshake.png')} 
              style={[styles.navIcon, styles.navIconActive]}
              resizeMode="contain"
            /> */}
            <View style={[styles.navIconPlaceholder, { backgroundColor: palette.yellow }]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            {/* TODO: 이미지 추가 - assets/nav_person.png */}
            {/* <Image 
              source={require('../../assets/nav_person.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            /> */}
            <View style={styles.navIconPlaceholder} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.black },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: palette.black },

  header: { 
    marginTop: 8, 
    marginBottom: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },

  headerText: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '700',
    ...typography.bold,
  },

  newPostButton: {
    width: 40,
    height: 40,
    backgroundColor: palette.yellow,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPostIcon: {
    width: 24,
    height: 24,
    tintColor: palette.black,
  },

  searchRow: { 
    marginBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  searchBox: {
    flex: 1,
    backgroundColor: palette.gray,
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 50,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { 
    flex: 1,
    color: palette.white, 
    fontSize: 14,
    padding: 0,
  },
  searchIconContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: '#999', // 필요시 색상 조정
  },
  searchIcon: {
    fontSize: 18,
  },

  filterRow: { 
    marginBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  filterLabel: { 
    color: palette.white, 
    marginRight: 12, 
    fontSize: 14,
    fontWeight: '600',
    ...typography.semibold 
  },

  filterChipActive: {
    backgroundColor: palette.yellow,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChip: {
    backgroundColor: palette.gray,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  filterChipTextActive: { 
    color: palette.black, 
    fontSize: 14,
    fontWeight: '700',
    ...typography.bold 
  },
  filterChipText: { 
    color: palette.white, 
    fontSize: 14,
    fontWeight: '600',
    ...typography.semibold 
  },

  postContainer: { marginBottom: 20 },

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

  nickname: { 
    color: palette.white, 
    fontSize: 16,
    fontWeight: '700',
    ...typography.bold 
  },
  location: { 
    color: '#999', 
    fontSize: 12, 
    marginTop: 4 
  },

  trophyIcon: {
    fontSize: 16,
    marginLeft: 6,
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

  card: {
    backgroundColor: palette.gray,
    padding: 18,
    borderRadius: 16,
  },

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

  description: {
    color: '#999',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },

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
    color: palette.yellow,
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

  row: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  bottomRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
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

  // TODO: 하단 네비게이션 바 스타일
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: palette.black,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20, // SafeArea 하단 여백
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#666', // 비활성화 색상
  },
  navIconActive: {
    tintColor: palette.yellow, // 활성화 색상 (러닝, 악수 아이콘)
  },
  navIconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: '#666', // TODO: 이미지 추가 후 제거
    borderRadius: 4,
  },
  // navIconPlaceholder의 활성화 상태는 navIconActive 클래스와 함께 사용
  // backgroundColor를 palette.yellow로 변경하려면 인라인 스타일 사용
});
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { palette, typography } from "@styles/globalStyles";
import ScreenHeader from "@components/ScreenHeader";
import BottomNavigationBar from "@components/BottomNavigationBar";
import PostCard from "./components/PostCard";
import FilterChip from "./components/FilterChip";
import NewPostPopUp from "./components/NewPostPopUp";

const iconNewPost = require("@assets/community/new_post.png");
const iconSearch = require("@assets/community/search.png");
// TODO: 이미지 추가 필요
// const iconProfile = require('@assets/profile_placeholder.png'); // 프로필 사진

const MOCK_POSTS = [
  {
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
  },
  {
    id: "2",
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
  },
  {
    id: "3",
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
  },
  {
    id: "4",
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
  },
];

export default function Community() {
  const navigation = useNavigation();
  const route = useRoute();

  // 필터 선택 상태 관리
  const [selectedFilter, setSelectedFilter] = useState("수지구 죽전동");
  const [isNewPostVisible, setIsNewPostVisible] = useState(false);

  const filterOptions = ["수지구 죽전동", "수지구 보정동"]; // 백엔드한테 받아야함

  const handleNewPostPress = () => {
    setIsNewPostVisible(true);
  };

  const handlePostSubmit = (postData) => {
    // TODO: API 호출로 게시물 작성
    console.log("새 게시물 작성:", postData);
    // 작성 후 게시물 목록 새로고침
  };

  const renderPost = ({ item }) => <PostCard post={item} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader
            title="Community"
            rightContent={
              <TouchableOpacity
                style={styles.newPostButton}
                onPress={handleNewPostPress}
                activeOpacity={0.7}
              >
                <Image source={iconNewPost} style={styles.newPostIcon} />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="제목, 작성자, 내용을 검색하세요"
              placeholderTextColor={palette.grayPlaceholder}
              style={styles.searchInput}
            />
            {/* TODO: 검색 아이콘 이미지 추가 필요 - assets/search_icon.png */}
            <TouchableOpacity style={styles.searchIconContainer}>
              <Image
                source={iconSearch}
                style={styles.searchIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>지역</Text>

          {filterOptions.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              isActive={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </View>

        <FlatList
          data={MOCK_POSTS}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
      <BottomNavigationBar navigation={navigation} currentRoute={route.name} />
      <NewPostPopUp
        visible={isNewPostVisible}
        onClose={() => setIsNewPostVisible(false)}
        onSubmit={handlePostSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.black },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: palette.black },
  headerContainer: {
    marginTop: 8,
    marginBottom: 16,
  },

  newPostButton: {
    width: 33,
    height: 33,
    backgroundColor: palette.black,
    borderColor: palette.grayBorder,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  newPostIcon: {
    width: 14.79,
    height: 14.79,
    tintColor: palette.green,
  },

  searchRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    backgroundColor: palette.gray,
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 50,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    color: palette.white,
    fontSize: 14,
    padding: 0,
  },
  searchIconContainer: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIconImage: {
    width: 18,
    height: 18,
    tintColor: palette.grayLight,
  },

  filterRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    color: palette.white,
    marginRight: 12,
    fontSize: 14,
    fontWeight: "600",
    ...typography.semibold,
  },
});

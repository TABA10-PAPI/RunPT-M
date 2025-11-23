import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
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
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // TODO: 백엔드에서 필터 옵션 받아오기 (현재는 하드코딩)
  // GET /community/filters 또는 유사한 API
  const filterOptions = ["수지구 죽전동", "수지구 보정동"];

  // API 응답을 PostCard 형식으로 변환
  const transformPostData = (apiPost) => {
    return {
      id: String(apiPost.id || ""),
      name: apiPost.nickname || "사용자", // TODO: tier 값 처리
      location: apiPost.title || "",
      place: apiPost.startpoint || "",
      startTime: apiPost.starttime || "",
      distance: `${apiPost.distance || 0}KM`,
      duration: "", // API에 없음
      pace: apiPost.targetpace || "",
      likes: 0, // API에 없음
      comments: apiPost.comments?.length || 0,
      description: apiPost.shortinfo || "",
      timestamp: apiPost.createAt || "",
      // API 원본 데이터 유지
      apiData: apiPost,
    };
  };

  // 게시물 목록 가져오기
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const uid = await AsyncStorage.getItem("uid");
      if (!uid) {
        console.log("[Community] uid가 없어서 게시물을 가져올 수 없습니다.");
        setIsLoading(false);
        return;
      }

      // GET /community/home?uid={uid}
      const response = await apiClient.get("/community/home", {
        params: { uid },
      });

      console.log("[Community] 게시물 목록 응답:", response.data);

      if (Array.isArray(response.data)) {
        const transformedPosts = response.data.map(transformPostData);
        setPosts(transformedPosts);
      } else {
        console.error("[Community] 게시물 목록 형식이 올바르지 않습니다:", response.data);
      }
    } catch (error) {
      console.error("[Community] 게시물 목록 가져오기 실패:", error);
      Alert.alert("오류", "게시물을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPostPress = () => {
    setIsNewPostVisible(true);
  };

  const handlePostSubmit = async (postData) => {
    try {
      const uid = await AsyncStorage.getItem("uid");
      if (!uid) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      // POST /community/add
      await apiClient.post("/community/add", {
        uid: parseInt(uid, 10),
        title: postData.title,
        startpoint: postData.startpoint,
        distance: postData.distance,
        starttime: postData.starttime,
        targetpace: postData.targetpace,
        shortinfo: postData.shortinfo,
      });

      console.log("[Community] 게시물 작성 성공");
      
      // 게시물 목록 새로고침
      await fetchPosts();
    } catch (error) {
      console.error("[Community] 게시물 작성 실패:", error);
      Alert.alert("오류", error.response?.data?.message || "게시물 작성에 실패했습니다.");
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    // TODO: 검색 기능은 백엔드 API가 준비되면 구현
    // 현재는 클라이언트 사이드 필터링
    console.log("[Community] 검색어:", text);
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
              value={searchText}
              onChangeText={handleSearch}
            />
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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.green} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshing={isLoading}
            onRefresh={fetchPosts}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

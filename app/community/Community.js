import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import apiClient from "@config/api";
import { useUid } from "@hooks/UseUid";
import { palette } from "@styles/globalStyles";
import ScreenHeader from "@components/ScreenHeader";
import BottomNavigationBar from "@components/BottomNavigationBar";
import PostCard from "./components/PostCard";
import NewPostPopUp from "./components/NewPostPopUp";
import Icon from "react-native-vector-icons/Feather";

/**
 * 커뮤니티 게시물 목록 화면
 * - 게시물 목록을 표시하고 새 게시물 작성 기능 제공
 * - 검색 기능 (현재 미구현)
 */
export default function Community() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid } = useUid();

  const [isNewPostVisible, setIsNewPostVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // 페이스 문자열을 분 단위로 변환 (예: "6'30"" -> 6.5분)
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
    
    // 티어 값 처리: 객체인 경우 가장 높은 티어 찾기, 문자열인 경우 그대로 사용
    let tierValue = null;
    if (apiPost.tier) {
      if (typeof apiPost.tier === "object" && apiPost.tier !== null) {
        // 객체인 경우 가장 높은 티어 찾기 (Home.js와 동일한 로직)
        const tierOrder = {
          'BRONZE': 1,
          'SILVER': 2,
          'GOLD': 3,
          'PLATINUM': 4,
          'DIAMOND': 5,
          'MASTER': 6,
          'CHALLENGER': 7,
        };
        
        const tiers = [
          apiPost.tier.km3,
          apiPost.tier.km5,
          apiPost.tier.km10,
          apiPost.tier.half,
          apiPost.tier.full,
        ].filter(Boolean);
        
        if (tiers.length > 0) {
          tierValue = tiers.reduce((max, tier) => {
            const maxOrder = tierOrder[max?.toUpperCase()] || 0;
            const currentOrder = tierOrder[tier?.toUpperCase()] || 0;
            return currentOrder > maxOrder ? tier : max;
          });
        }
      } else if (typeof apiPost.tier === "string") {
        tierValue = apiPost.tier;
      }
    }

    return {
      id: String(apiPost.id || ""),
      name: apiPost.nickname || "사용자",
      location: apiPost.title || "",
      place: apiPost.startpoint || "",
      startTime: apiPost.starttime || "",
      distance: `${distance}KM`,
      duration: duration,
      pace: pace,
      comments: commentCount,
      description: apiPost.shortinfo || "",
      timestamp: apiPost.createAt || "",
      tier: tierValue,
      participateuser: apiPost.participateuser || 0,
      isParticipated: isParticipated,
      apiData: apiPost,
    };
  };

  // 게시물 목록 가져오기
  const fetchPosts = async () => {
      if (!uid) {
        setIsLoading(false);
        return;
      }

    try {
      setIsLoading(true);

      const response = await apiClient.post("/community/home", {
        uid: Number(uid),
      });

      // 새로운 응답 형식: response.data.body.communitys
      let communitys = null;
      
      if (response.data?.body?.communitys) {
        communitys = response.data.body.communitys;
      } else if (response.data?.communitys) {
        // 이전 형식 호환성 유지
        communitys = response.data.communitys;
      }

      if (Array.isArray(communitys)) {
        const transformedPostsPromises = communitys.map(post => transformPostData(post));
        const transformedPosts = await Promise.all(transformedPostsPromises);
        setPosts(transformedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      Alert.alert("오류", "게시물을 불러오는데 실패했습니다.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchPosts();
    }
  }, [uid]);

  useFocusEffect(
    React.useCallback(() => {
      if (uid) {
        fetchPosts();
      }
    }, [uid])
  );

  const handleNewPostPress = () => {
    setIsNewPostVisible(true);
  };

  const handlePostSubmit = async () => {
    await fetchPosts();
    setIsNewPostVisible(false);
  };

  // 검색 기능
  const handleSearch = (text) => {
    setSearchText(text);
  };

  // 검색어로 게시물 필터링
  const filteredPosts = React.useMemo(() => {
    if (!searchText.trim()) {
      return posts;
    }

    const searchLower = searchText.toLowerCase().trim();
    
    return posts.filter((post) => {
      // 제목 검색
      const titleMatch = post.location?.toLowerCase().includes(searchLower);
      // 작성자 검색
      const authorMatch = post.name?.toLowerCase().includes(searchLower);
      // 내용 검색
      const descriptionMatch = post.description?.toLowerCase().includes(searchLower);
      // 장소 검색
      const placeMatch = post.place?.toLowerCase().includes(searchLower);
      
      return titleMatch || authorMatch || descriptionMatch || placeMatch;
    });
  }, [posts, searchText]);

  const renderPost = ({ item }) => <PostCard post={item} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
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
                <Icon name="edit" size={15} color={palette.green} />
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
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchText("")}
                activeOpacity={0.7}
              >
                <Icon name="x" size={15} color={palette.grayLight} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.searchIconContainer}>
              <Icon name="search" size={15} color={palette.grayLight} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.green} />
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : `post-${index}`}
            renderItem={renderPost}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshing={isLoading}
            onRefresh={fetchPosts}
            ListEmptyComponent={
              searchText.trim() ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    '{searchText}'에 대한 검색 결과가 없습니다.
                  </Text>
                </View>
              ) : null
            }
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
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  clearButton: {
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: palette.grayLight,
    fontSize: 14,
    textAlign: "center",
  },
});

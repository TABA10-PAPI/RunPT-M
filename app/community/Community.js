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


export default function Community() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid } = useUid();

  const [isNewPostVisible, setIsNewPostVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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

  // API 응답을 PostCard 형식으로 변환
  const transformPostData = (apiPost) => {
    // 댓글 개수: API 응답에 comments 필드가 있으면 그 길이를 사용하고, 
    // 없으면 commentCount나 다른 필드를 확인, 모두 없으면 0
    let commentCount = 0;
    if (apiPost.comments && Array.isArray(apiPost.comments)) {
      commentCount = apiPost.comments.length;
    } else if (apiPost.commentCount !== undefined) {
      commentCount = Number(apiPost.commentCount) || 0;
    } else if (apiPost.comments !== undefined) {
      // comments가 숫자일 수도 있음
      commentCount = Number(apiPost.comments) || 0;
    }

    const distance = apiPost.distance || 0;
    const pace = apiPost.targetpace || "";
    const duration = calculateDuration(distance, pace);

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
      tier: apiPost.tier || "UNRANKED",
      participateuser: apiPost.participateuser || 0,
      isParticipated: false, // TODO: 백엔드에서 현재 사용자의 참가 여부를 확인해야 함
      // API 원본 데이터 유지
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

      let communitys = null;
      
      if (response.data?.body) {
        communitys = response.data.body.communitys;
      } else if (response.data?.communitys) {
        communitys = response.data.communitys;
      }

      if (Array.isArray(communitys)) {
        const transformedPosts = communitys.map(transformPostData);
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

  // 화면이 포커스될 때마다 게시물 목록 새로고침 (DetailPost에서 돌아올 때 동기화)
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
    // NewPostPopUp에서 이미 API 호출을 했으므로, 여기서는 목록만 새로고침
      await fetchPosts();
    setIsNewPostVisible(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    // TODO: 검색 기능은 백엔드 API가 준비되면 구현
  };

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

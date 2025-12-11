import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import Home from "@app/home/Home";
import Run from "@app/run/Run";
import Battery from "@app/battery/Battery";
import Community from "@app/community/Community";
import DetailPost from "@app/community/DetailPost";
import Mypage from "@app/mypage/Mypage";
import KakaoCallback from "@app/OAuth/KakaoCallback";
import NaverCallback from "@app/OAuth/NaverCallback";
import Join from "@app/start/Join";
import Login from "@app/start/Login";
import Welcome from "@app/start/Welcome";
import { useUid } from "@hooks/UseUid";

const Stack = createNativeStackNavigator();
const linking = {
  prefixes: ["http://localhost:8081"],
  config: {
    screens: {
      Welcome: "",
      Login: "login",
      Join: "join",
      Home: "home",
      Run: "run",
      Battery: "battery",
      Community: "community",
      DetailPost: "community/:postId",
      Mypage: "mypage",
      KakaoCallback: "oauth/kakao",
      NaverCallback: "oauth/naver",
    },
  },
};

export default function App() {
  const { uid, isLoading } = useUid();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      // uid가 있으면 자동 로그인 (Home으로), 없으면 Welcome으로
      setInitialRoute(uid ? "Home" : "Welcome");
    }
  }, [uid, isLoading]);

  // 로딩 중일 때는 스플래시 화면 표시
  if (isLoading || initialRoute === null) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF88" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#090909" },
          }}
        >
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Join" component={Join} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Run" component={Run} />
          <Stack.Screen name="Battery" component={Battery} />
          <Stack.Screen name="Community" component={Community} />
          <Stack.Screen name="DetailPost" component={DetailPost} />
          <Stack.Screen name="Mypage" component={Mypage} />
          <Stack.Screen name="KakaoCallback" component={KakaoCallback} />
          <Stack.Screen name="NaverCallback" component={NaverCallback} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090909",
  },
});

import * as WebBrowser from "expo-web-browser";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, palette, typography } from "@styles/globalStyles";
import { KAKAO_AUTH_URL, NAVER_AUTH_URL } from "@app/OAuth/Oauth.js";
import { startAsync } from "expo-auth-session";
import { useNavigation } from "@react-navigation/native";
import KakaoCallback from "../OAuth/KakaoCallback";


const logo = require("@assets/logo.png");
const kakaoImage = require("@assets/login/kakao_phone.png");
const naverImage = require("@assets/login/naver_phone.png");


export default function Login() {
    const navigation = useNavigation();

  // const openOAuth = async (target) => {
  //   try {
  //     const url = target === "kakao" ? KAKAO_AUTH_URL : NAVER_AUTH_URL;
  //     if (!url) {
  //       Alert.alert("설정 오류", "OAuth URL이 설정되지 않았습니다.");
  //       return;
  //     }
  //     await WebBrowser.openBrowserAsync(url);
  //   } catch (error) {
  //     console.error("OAuth open failed", error);
  //     Alert.alert("로그인 오류", "소셜 로그인 페이지를 열 수 없습니다.");
  //   }
  // };

  // const openOAuth = async (target) => {
  //   const authUrl = target  === "kakao" ? KAKAO_AUTH_URL : NAVER_AUTH_URL;
  //   try {
  //     const result = await startAsync({ authUrl });

  //     if (result.type === "success") {
  //       code =  result.params.code;
  //       navigation.navigate("KakaoCallback", { code });
  //     }
  //   } catch (error) {
  //     console.error("Kakao login failed", error);
  //     Alert.alert("로그인 오류", "카카오 로그인 중 문제가 발생했습니다.");
  //   }
  //   return null;
  // };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.mainContent}>
          <Text style={[styles.title, typography.bold]}>환영합니다.</Text>
          <Text style={[styles.subtitle, typography.semibold]}>
            <Text style={styles.highlight}>RunPT</Text>로{"\n"}스마트한 러닝을
            시작해보세요.
          </Text>

          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.loginButton, styles.kakaoButton]}
            onPress={() => navigation.navigate("KakaoCallback")}
            activeOpacity={0.8}
          >
            <Image source={kakaoImage} style={styles.buttonImage} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, styles.naverButton]}
            onPress={() => navigation.navigate("NaverCallback")}
            activeOpacity={0.8}
          >
            <Image source={naverImage} style={styles.buttonImage} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 32,
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    color: palette.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: palette.white,
    marginBottom: 40,
  },
  highlight: {
    color: palette.green,
  },
  logo: {
    width: "100%",
    height: 240,
    marginBottom: 48,
  },
  buttonWrapper: {
    gap: 16,
    paddingBottom: 16,
  },
  loginButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  naverButton: {
    backgroundColor: "#03C75A",
  },
  buttonImage: {
    width: "100%",
    height: 40,
    resizeMode: "contain",
  },
});

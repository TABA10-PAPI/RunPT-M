import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  globalStyles,
  typography
} from "@styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("@assets/logo.png");

export default function Welcome({ navigation }) {
  const goNext = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.content}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, typography.bold]}>RunPT</Text>
          <Text style={[styles.subtitle, typography.semibold]}>
            AI가 만드는 나만의 러닝 코치
          </Text>
        </View>
        <TouchableOpacity
          style={[globalStyles.bigButton, styles.button]}
          onPress={goNext}
        >
          <Text style={[globalStyles.bigButtonLabel, typography.bold]}>
            시작하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  button: {
    marginTop: 24,
  },
});

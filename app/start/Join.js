import { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@config/api";
import {
  globalStyles,
  palette,
  typography,
} from "@styles/globalStyles";
import { useNavigation , useRoute} from "@react-navigation/native";
import FilterChip from "@app/community/components/FilterChip";
import { useUid } from "@hooks/UseUid";
export default function Join() {
  const route = useRoute();
  const navigation = useNavigation();
  const { uid: uidFromHook, setUid } = useUid();

  const { uid: uidFromParams, default_nickname } = route.params || {};
  
  // route.params에서 받은 uid가 있으면 저장
  useEffect(() => {
    if (uidFromParams) {
      setUid(uidFromParams);
    }
  }, [uidFromParams, setUid]);

  // uid는 route.params에서 받은 것을 우선 사용, 없으면 훅에서 가져온 것 사용
  const uid = uidFromParams || uidFromHook;

  const [nickname, setNickname] = useState(default_nickname ?? "");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");


  const handleSubmit = async () => {
    if (!uid) {
      Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
      return;
    }

    if (!nickname || !height || !weight || !age || !gender) {
      Alert.alert("입력 필요", "모든 항목을 입력해 주세요.");
      return;
    }

    // gender를 "M" 또는 "F"로 변환
    const genderValue = gender === "Male" ? "M" : gender === "Female" ? "F" : gender;

    const data = {
      uid: Number(uid),
      nickname: nickname,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender: genderValue,
    };
    
    try {
      const response = await apiClient.post("/auth/join", data);
      
      // Join 완료 후에도 uid를 저장 (이미 저장되어 있을 수 있지만 안전하게)
      await setUid(uid);
      
      Alert.alert("완료", "정보가 정상적으로 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.navigate("Home"),
        }
      ]);
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || "정보 저장에 실패했습니다.";
      
      Alert.alert(
        "오류", 
        errorMessage + "\n\n네트워크 연결을 확인해주세요.",
        [{ text: "확인" }]
      );
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[globalStyles.container, styles.container]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, typography.bold]}>RunPT</Text>
        <Text style={[styles.subtitle, typography.bold]}>
          신체정보를 입력하고 {"\n"}내 몸에 맞는 러닝을 시작해보세요!
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, typography.semibold]}>닉네임</Text>
            <TextInput
              placeholder="닉네임 입력"
              placeholderTextColor="#777777"
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, typography.semibold]}>키 (cm)</Text>
            <TextInput
              placeholder="키 입력"
              placeholderTextColor="#777777"
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, typography.semibold]}>체중 (kg)</Text>
            <TextInput
              placeholder="체중 입력"
              placeholderTextColor="#777777"
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, typography.semibold]}>나이</Text>
            <TextInput
              placeholder="나이 입력"
              placeholderTextColor="#777777"
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, typography.semibold]}>성별</Text>
            <View style={styles.genderContainer}>
              <FilterChip
                label="Male"
                isActive={gender === "Male"}
                onPress={() => setGender("Male")}
              />
              <FilterChip
                label="Female"
                isActive={gender === "Female"}
                onPress={() => setGender("Female")}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[globalStyles.bigButton, styles.button]}
          onPress={handleSubmit}
        >
          <Text style={[globalStyles.bigButtonLabel, styles.buttonLabel]}>
            완료
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingTop: 40,
    paddingBottom: 60,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: "#FFFFFF",
    marginBottom: 32,
    fontWeight: "700",
  },
  form: {
    gap: 24,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: palette.gray,
    color: palette.white,
    fontSize: 16,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.black,
    textAlign: "center",
  },
});

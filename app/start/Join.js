import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@config/api";
import {
  globalStyles,
  palette,
  typography,
} from "@styles/globalStyles";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useUid } from "@hooks/UseUid";
export default function Join() {
  const route = useRoute();
  const navigation = useNavigation();
  const { setUid } = useUid();

  const { uid: uidFromParams, default_nickname } = route.params || {};
  
  // uid는 route.params에서 받은 것을 우선 사용
  // Join 화면에서는 uid를 저장하지 않음 (Join 완료 후에만 저장)
  const uid = uidFromParams;

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
    const genderValue = gender === "남성" ? "M" : gender === "여성" ? "F" : gender;

    const data = {
      uid: Number(uid),
      nickname: nickname,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender: genderValue,
    };
    
    try {
      const response = await apiClient.post("/user/join", data);
      
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[globalStyles.container, styles.container]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Text style={[styles.title, typography.extrabold]}>RunPT</Text>
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
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "남성" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("남성")}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === "남성" && styles.genderButtonTextActive,
                  ]}
                >
                  남성
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "여성" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("여성")}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === "여성" && styles.genderButtonTextActive,
                  ]}
                >
                  여성
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[globalStyles.bigButton, styles.button]}
            onPress={handleSubmit}
          >
            <Text style={[globalStyles.bigButtonLabel]}>
              완료
          </Text>
        </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingTop: 24,
    paddingBottom: 150,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: palette.green,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: "#FFFFFF",
    marginBottom: 20,
    fontWeight: "700",
  },
  form: {
    gap: 18,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: palette.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonActive: {
    backgroundColor: palette.green,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.white,
  },
  genderButtonTextActive: {
    color: palette.black,
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
  buttonContainer: {
    paddingBottom: 20,
  },
});

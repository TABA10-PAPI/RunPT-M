import { StyleSheet } from "react-native";

export const palette = {
  green: "#DAFD2E",
  yellow: "#FFFF00",
  red: "#FF4D4F",
  black: "#090909",
  white: "#F8F8F8",
  gray: "#252525",
};

export const typography = {
  regular: {
    fontFamily: "Inter-Regular",
    fontWeight: "400" as const,
  },
  semibold: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600" as const,
  },
  bold: {
    fontFamily: "Inter-Bold",
    fontWeight: "700" as const,
  },
};

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.black,
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: "5%",
    backgroundColor: palette.black,
  },
  bigButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: palette.green,
    shadowColor: palette.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  bigButtonLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: palette.black,
  },
});


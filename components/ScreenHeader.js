import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette } from "@styles/globalStyles";

export default function ScreenHeader({ title, subtitle, rightContent, leftContent }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightContent ? <View style={styles.right}>{rightContent}</View> : null}
      {leftContent ? <View style={styles.left}>{leftContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.white,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 14,
    color: "#b5b5b5",
  },
  right: {
    position: "absolute",
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 10,
  },
  left: {
    position: "absolute",
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 10,
  },
});


import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "../styles/globalStyles";

import RunIcon from "../assets/run.png";
import BatteryIcon from "../assets/battery.png";
import HomeIcon from "../assets/home.png";
import CommunityIcon from "../assets/community.png";
import MypageIcon from "../assets/mypage.png";

export default function BottomNavigationBar({ navigation, currentRoute }) {
  const insets = useSafeAreaInsets();

  const navItems = [
    { key: "run", icon: RunIcon, route: "Run" },
    { key: "battery", icon: BatteryIcon, route: "Battery" },
    { key: "home", icon: HomeIcon, route: "Home" },
    { key: "community", icon: CommunityIcon, route: "Community" },
    { key: "mypage", icon: MypageIcon, route: "Mypage" },
  ];

  const handlePress = (route) => {
    if (navigation && route !== currentRoute) {
      navigation.navigate(route);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* 네비게이션 아이템들 */}
      <View style={styles.navItems}>
        {navItems.map(({ key, icon, route }) => {
          const isActive = currentRoute === route;
          const isSmall = key === "home" || key === "community" || key === "mypage";
          return (
            <TouchableOpacity
              key={key}
              style={styles.navItem}
              onPress={() => handlePress(route)}
              activeOpacity={0.7}
            >
              <Image
                source={icon}
                style={[
                  styles.icon,
                  isSmall && styles.iconSmall,
                  isActive && styles.iconActive,
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.gray,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    paddingBottom: 6,
    shadowColor: palette.green,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  navItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: palette.white,
    opacity: 0.8,
  },
  iconSmall: {
    width: 22,
    height: 22,
  },
  iconActive: {
    tintColor: palette.green,
    opacity: 1,
  },
});


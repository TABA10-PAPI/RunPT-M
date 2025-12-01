import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { palette, typography } from "@styles/globalStyles";

/**
 * 게시물 메뉴 팝업 컴포넌트
 * - 게시물 수정/삭제 메뉴 (작성자만 표시)
 */
export default function PostMenuPopUp({ visible, onClose, onEdit, onDelete }) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>게시물 메뉴</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Icon name="x-circle" size={20} color={palette.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.separator} />

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onEdit();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>게시물 수정</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onDelete();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, styles.deleteText]}>게시물 삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    backgroundColor: palette.grayDark,
    borderRadius: 16,
    width: "80%",
    maxWidth: 400,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.white,
    ...typography.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    flex: 17,
    borderBottomWidth: 1,
    width: "100%",
    borderBottomColor: '#E1E2E4',
    marginBottom: 12,
  },
  menuContainer: {
    width: "100%",
  },
  menuItem: {
    paddingVertical: 16,
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
    ...typography.semibold,
  },
  deleteText: {
    color: palette.red,
  },
  divider: {
    height: 1,
    backgroundColor: palette.grayDark,
    marginVertical: 4,
  },
});


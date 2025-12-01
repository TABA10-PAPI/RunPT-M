import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { palette, typography } from "@styles/globalStyles";

export default function DeleteConfirmPopUp({ visible, onClose, onConfirm, title, message }) {
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
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.popupContainer}>
          <Text style={styles.title}>{title || "삭제하시겠습니까?"}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  popupContainer: {
    backgroundColor: palette.grayDark,
    borderRadius: 16,
    width: "80%",
    maxWidth: 350,
    padding: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.white,
    textAlign: "center",
    marginBottom: 12,
    ...typography.bold,
  },
  message: {
    fontSize: 14,
    color: palette.grayLight,
    textAlign: "center",
    marginBottom: 24,
    ...typography.regular,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: palette.grayMedium,
  },
  confirmButton: {
    backgroundColor: palette.red,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
    ...typography.semibold,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
    ...typography.semibold,
  },
});


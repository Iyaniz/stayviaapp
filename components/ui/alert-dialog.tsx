import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="bg-white dark:bg-neutral-900 w-4/5 rounded-2xl p-5 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            {message}
          </Text>

          <View className="flex-row justify-end mt-5 space-x-3">
            <TouchableOpacity
              onPress={onCancel}
              className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 mr-1"
            >
              <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`px-4 py-2 rounded-xl ${
                destructive
                  ? "bg-red-600"
                  : "bg-indigo-600 dark:bg-indigo-500"
              }`}
            >
              <Text className="text-sm font-medium text-white">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

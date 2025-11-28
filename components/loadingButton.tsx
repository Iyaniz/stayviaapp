import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type LoadingButtonProps = {
  onPress: () => void;
  loading?: boolean;
  title?: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
};

export default function LoadingButton({
  onPress,
  loading = false,
  title = "Save",
  loadingText = "Saving...",
  className = "",
  disabled = false,
}: LoadingButtonProps) {
  return (
    <TouchableOpacity
      disabled={loading || disabled}
      onPress={onPress}
      className={`py-3 rounded-lg mt-6 items-center ${
        loading ? "bg-indigo-400" : "bg-indigo-600"
      } ${className}`}
    >
      {loading ? (
        <View className="flex-row items-center justify-center space-x-2">
          {/* <ActivityIndicator size="small" color="#fff" /> */}
          <Text className="text-white font-bold text-base">{loadingText}</Text>
        </View>
      ) : (
        <Text className="text-white font-bold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
}

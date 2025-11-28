import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

export function SubmitButton({
  title,
  loading,
  onPress,
  colorScheme,
}: {
  title: string;
  loading?: boolean;
  onPress: () => void;
  colorScheme: any;
}) {
  return (
    <TouchableOpacity
      disabled={loading}
      onPress={onPress}
      className="rounded-md py-3 items-center mt-4"
      style={{
        backgroundColor: colorScheme.primary,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="font-bold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}

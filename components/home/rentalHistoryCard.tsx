import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoadingButton from "@/components/loadingButton";

type RentalHistoryCardProps = {
  title: string;
  address: string;
  stayed: string;
  rent: string;
  rating: string;
  loading?: boolean;
  onPress: () => void;
};

export default function RentalHistoryCard({
  title,
  address,
  stayed,
  rent,
  rating,
  loading = false,
  onPress,
}: RentalHistoryCardProps) {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const colors = {
    bg: darkMode ? "bg-gray-900" : "bg-white",
    textPrimary: darkMode ? "text-gray-100" : "text-gray-800",
    textSecondary: darkMode ? "text-gray-400" : "text-gray-600",
    textRating: "text-yellow-500",
    iconColor: "#2563EB",
  };

  return (
    <View className={`${colors.bg} shadow-md rounded-xl p-4 mb-4`}>
      <View className="flex-row items-center mb-2">
        <Ionicons name="home" size={24} color={colors.iconColor} />
        <Text className={`ml-2 font-semibold ${colors.textPrimary}`}>{title}</Text>
      </View>

      <Text className={`${colors.textSecondary}`}>{address}</Text>
      <Text className={`${colors.textSecondary} mt-2`}>{stayed}</Text>
      <Text className={`${colors.textSecondary}`}>{rent}</Text>
      <Text className={`${colors.textRating}`}>{rating}</Text>

      <LoadingButton
        onPress={onPress}
        loading={loading}
        title="View Post"
        loadingText="Viewing..."
        className="mt-4"
      />
    </View>
  );
}

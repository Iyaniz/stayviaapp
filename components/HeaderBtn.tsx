import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type HeaderProps = {
  title: string;
  route?: string; // optional route prop
};

export default function Header({ title, route }: HeaderProps) {
  const router = useRouter();

  const handlePress = () => {
    if (route) {
      router.push(route as any);
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center w-full my-3">
      <TouchableOpacity onPress={handlePress}>
        <Ionicons name="chevron-back" size={28} color="#4B5563" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold dark:text-white ml-2">
        {title}
      </Text>
    </View>
  );
}

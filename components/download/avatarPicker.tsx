import React from "react";
import { TouchableOpacity, View, Text, Image, SafeAreaView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import DownloadImage from "./downloadImage";
import { useSupabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/userService";
import { useUser } from "@clerk/clerk-expo";

interface AvatarPickerProps {
  uri?: string;
  onChange: (uri: string | undefined) => void;
  size?: number;
}

export default function AvatarPicker({ uri, onChange, size = 96 }: AvatarPickerProps) {
  const { user } = useUser();
  const supabase = useSupabase();
  const id = user?.id;

  const { data, error, isLoading } = useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id as string, supabase),
    enabled: !!id,
  });

  if (error) console.log("Error fetching user data:", error);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-gray-900 dark:text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  const pickAvatarAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      onChange(result.assets[0].uri);
    }
  };

  const removeAvatar = () => onChange(undefined);

  const defaultAvatar = "https://i.pravatar.cc/150";
  const storagePath = data?.avatar || null;

  return (
    <View className="items-center mb-6">
      <TouchableOpacity onPress={pickAvatarAsync}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: "#ccc",
            }}
          />
        ) : (
          <DownloadImage
            supabase={supabase}
            path={storagePath}
            fallbackUri={defaultAvatar}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: "#ccc",
            }}
          />
        )}

        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#2563eb",
            borderRadius: 9999,
            padding: 4,
          }}
        >
          <Ionicons name="camera" size={18} color="white" />
        </View>
      </TouchableOpacity>

      {uri && (
        <TouchableOpacity onPress={removeAvatar} className="mt-2">
          <Text className="text-red-500">Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

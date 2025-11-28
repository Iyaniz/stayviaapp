import React, { useState } from "react";
import { TouchableOpacity, View, Text, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ImageUploaderProps {
  uri?: string;
  onChange: (uri: string | undefined) => void;
  placeholder?: string;
  size?: number;
  uploading?: boolean;
}

export default function ImageUploader({
  uri,
  onChange,
  placeholder = "Tap to select image",
  size = 200,
  uploading = false,
}: ImageUploaderProps) {
  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      onChange(result.assets[0].uri);
    }
  };

  const removeImage = () => onChange(undefined);

  return (
    <TouchableOpacity
      onPress={pickImageAsync}
      className="p-3 rounded-xl border border-dashed border-gray-400 items-center justify-center mb-4 relative"
      style={{ width: size, height: size }}
    >
      {uri ? (
        <View>
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: 10, resizeMode: "cover" }}
          />
          <TouchableOpacity
            onPress={removeImage}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: 9999,
              padding: 5,
            }}
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : uploading ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-gray-500">{placeholder}</Text>
      )}
    </TouchableOpacity>
  );
}

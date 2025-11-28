// hooks/useImageUpload.ts
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useSupabase } from "@/lib/supabase";

export function useImageUpload(bucketName: string = "user-profiles") {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const supabase = useSupabase();

  // Pick image from gallery
  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Access to gallery is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      return uri;
    }
  };

  // Remove image
  const removeImage = () => {
    setSelectedImage(undefined);
  };

  // Upload image to Supabase
  const uploadImage = async (localUri: string) => {
    try {
      setUploading(true);
      const fileRes = await fetch(localUri);
      const arrayBuffer = await fileRes.arrayBuffer();

      const fileExt = localUri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;

      const { error, data } = await supabase.storage
        .from(bucketName)
        .upload(path, arrayBuffer, {
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;
      return data.path;
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to upload image.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedImage,
    uploading,
    pickImageAsync,
    uploadImage,
    removeImage,
    setSelectedImage,
  };
}

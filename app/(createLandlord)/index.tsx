import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserById, registerUser, updateUser } from "@/services/userService";
import { useAppTheme } from "@/lib/theme";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

type FormValues = {
  contact: number;
  landlord_proof_id?: string;
  avatar?: string;
};

export default function CreateLandlord() {
  const { user } = useUser();
  const supabase = useSupabase();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();

  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [avatar, setAvatar] = useState<string | undefined>();
  const [image, setImage] = useState<string | undefined>();

  const { control, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      contact: undefined,
      avatar: undefined,
    },
  });

  const userId = user?.id;

  // Fetch existing user info
  const { data, error, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId as string, supabase),
    enabled: !!userId,
  });

  // Download image helper
  const downloadImage = async (
    path: string,
    supabase: SupabaseClient<Database>
  ): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("user-profiles")
      .download(path);

    if (error || !data) throw error || new Error("Failed to download image");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(data);
    });
  };

  // Prefill form fields when data is loaded
  useEffect(() => {
    if (data) {
      if (data.contact) setValue("contact", data.contact);
      if (data?.avatar) {
        downloadImage(data.avatar, supabase)
          .then((url) => setImage(url))
          .catch((err) => 
            // console.error("Download image error:", err))
            Alert.alert("Image not loaded", err));
          
      }
    }
  }, [data, setValue, data?.avatar]);

  if (error) console.error("Error loading user:", error);

  // Avatar Picker
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
      setAvatar(result.assets[0].uri);
    }
  };

  const removeAvatar = () => setAvatar(undefined);

  // Upload Function
  const uploadImage = async (localUri: string, bucket: string) => {
    try {
      setUploading(true);
      const fileRes = await fetch(localUri);
      const arrayBuffer = await fileRes.arrayBuffer();
      const fileExt = localUri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;

      const { error, data } = await supabase.storage
        .from(bucket)
        .upload(path, arrayBuffer, {
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;
      return data.path;
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to upload image.");
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  const DEFAULT_AVATAR_URL =
    "https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/defaults/clerkimg.png";

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      let avatarPath: string | undefined;
      let proofPath: string | undefined;

      avatarPath = avatar
        ? await uploadImage(avatar, "user-profiles")
        : data?.avatar || DEFAULT_AVATAR_URL;

      if (selectedImage) {
        proofPath = await uploadImage(selectedImage, "user-profiles");
      }

      const payload = {
        contact: Number(watch("contact")),
        landlord_proof_id: proofPath,
        avatar: avatarPath,
        account_type: "landlord",
        id: user?.id || "",
        username: user?.username || "",
        email: user?.emailAddresses?.[0]?.emailAddress || "",
      };

      if (data) {
        return updateUser(user?.id as string, payload, supabase);
      } else {
        return registerUser(payload, supabase);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.replace("/(protected)/home");
      Alert.alert("Success", "Landlord account created successfully!");
    },
    onError: (err: any) => {
      console.error(err);
      Alert.alert("Error", "Failed to register landlord account.");
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Skeleton className="h-8 w-48 mb-4 rounded" />
      </View>
    );
  }

  if (isPending) {
    return (
      <ActivityIndicator
        size="large"
        className="flex-1 justify-center items-center"
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      {/* Back Button */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <Ionicons
          name="close"
          size={25}
          color={colors.foreground}
          onPress={() => router.back()}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View className="items-center mb-6">
            <TouchableOpacity onPress={pickAvatarAsync}>
              <Image
                source={{ uri: avatar || image }}
                className="w-24 h-24 rounded-full border-2 border-gray-300"
              />
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

            {avatar && (
              <TouchableOpacity onPress={removeAvatar} className="mt-2">
                <Text className="text-red-500">Remove</Text>
              </TouchableOpacity>
            )}

            <Text className="text-gray-500 text-sm font-semibold mt-3 dark:text-white">
              {user?.username
                ? user?.username
                : `${data?.firstname ?? ""} ${data?.lastname ?? ""}`}
            </Text>
          </View>

          {/* Contact Number */}
          <Label className="text-sm">Contact Number</Label>
          <Controller
            control={control}
            name="contact"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Enter your contact number"
                keyboardType="number-pad"
                value={value?.toString() || ""}
                onChangeText={onChange}
                className="mb-4"
              />
            )}
          />

          {/* Landlord Proof */}
          <Text className="text-sm mb-2">Upload a Valid ID Proof</Text>
          <TouchableOpacity
            onPress={async () => {
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
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
                setSelectedImage(result.assets[0].uri);
              }
            }}
            className="p-3 rounded-xl border border-dashed border-gray-400 items-center justify-center mb-4 relative"
          >
            {selectedImage ? (
              <View>
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 10,
                    resizeMode: "cover",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setSelectedImage(undefined)}
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
            ) : (
              <View className="w-32 h-32 rounded bg-gray-200 items-center justify-center">
                {uploading ? (
                  <Skeleton className="h-8 w-48 mb-4 rounded" />
                ) : (
                  <Text className="text-gray-500">Tap to select image</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Submit */}
          <Button className="mt-4" disabled={isPending} onPress={() => mutate()}>
            <Text className="text-white font-medium">
              {isPending ? "Registering..." : "Register Landlord Account"}
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

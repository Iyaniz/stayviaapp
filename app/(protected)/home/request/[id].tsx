import ScreenWrapper from "@/components/ScreenWrapper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import posts from "@/assets/data/posts.json";

export default function RentalRequestForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const post = posts.find((p) => p.id === id);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!name || !contact || !message) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    Alert.alert("Success", "Your rental request has been submitted!");
    router.back();
  };

  if (!post) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center">
          <Text>Post not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1 p-4">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text className="ml-1 text-lg font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text className="text-2xl font-bold mb-2">
          Request Rental for {post.title}
        </Text>
        <Text className="text-sm text-gray-500 mb-6">{post.location}</Text>

        {/* Form Fields */}
        <Text className="mb-1 font-semibold">Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        <Text className="mb-1 font-semibold">Contact Info</Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="Email or Phone"
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        <Text className="mb-1 font-semibold">Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Tell the owner about your request..."
          multiline
          numberOfLines={4}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-800 py-3 rounded-lg"
        >
          <Text className="text-center text-white font-semibold">
            Submit Request
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

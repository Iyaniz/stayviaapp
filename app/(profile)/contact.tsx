import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  View,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { querySupport } from "@/services/contactService";

export default function ContactSupport() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const { user } = useUser();
  const supabase = useSupabase();

  const [message, setMessage] = useState("");

  // Mutation to insert message
  const { mutate, isPending } = useMutation({
    mutationFn: (newMessage: string) =>
      querySupport(
        { user_id: user?.id, message: newMessage },
        supabase
      ),
    onSuccess: () => {
      Alert.alert("Success", "Your concern has been sent!");
      setMessage("");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Something went wrong.");
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert("Please enter a message before submitting.");
      return;
    }
    mutate(message.trim());
  };

  // Dynamic colors
  const bgColor = isDark ? "bg-black" : "bg-gray-100";
  const textPrimary = isDark ? "text-white" : "text-gray-800";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-700";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const iconColor = isDark ? "#fff" : "#1f2937";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.push("/(profile)/settings")}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-neutral-800" : "bg-gray-200"
              } mr-4`}
            >
              <FeatherIcon name="chevron-left" size={24} color={iconColor} />
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${textPrimary}`}>
              Contact Support
            </Text>
          </View>

          {/* Contact Form Card */}
          <Card className={`${isDark ? "bg-neutral-900" : "bg-white"}`}>
            <CardHeader>
              <CardTitle className={textPrimary}>Send us a message</CardTitle>
              <CardDescription className={textSecondary}>
                Write your concern or question below.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                value={message}
                onChangeText={setMessage}
                className={`border ${borderColor} rounded-md px-3 py-2 dark:text-white`}
                editable={!isPending}
              />
            </CardContent>

            <CardFooter className="mt-4">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isPending}
                className={`${
                  isPending ? "bg-blue-400" : "bg-blue-600"
                } rounded-xl py-3 flex-1 items-center`}
              >
                <Text className="text-white font-semibold text-base">
                  {isPending ? "Sending..." : "Send Message"}
                </Text>
              </TouchableOpacity>
            </CardFooter>
          </Card>

          <Text
            className={`text-sm mt-6 text-center ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            We’ll respond to your inquiry as soon as possible.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermsAndConditions() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  // Dynamic colors
  const bgColor = isDark ? "bg-black" : "bg-gray-100";
  const cardColor = isDark ? "bg-neutral-900" : "bg-white";
  const textPrimary = isDark ? "text-white" : "text-gray-800";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-700";
  const iconColor = isDark ? "#fff" : "#1f2937";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.push("/(profile)/settings")}
            className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-gray-200"} mr-4`}
          >
            <FeatherIcon name="chevron-left" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${textPrimary}`}>
            Terms & Conditions
          </Text>
        </View>

        {/* Terms Content Card */}
        <Card className={`${cardColor}`}>
          <CardHeader>
            <CardTitle className={textPrimary}>Terms & Conditions</CardTitle>
            <CardDescription className={`${textSecondary} dark:text-gray-200`}>
              Please read these terms carefully before using our app.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              1. <Text className="font-semibold">{`Acceptance of Terms:`}</Text> By accessing or using this app, you agree to comply with and be bound by these terms.
            </Text>
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              2. <Text className="font-semibold">{`User Accounts:`}</Text> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </Text>
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              3. <Text className="font-semibold">{`Payments & Booking:`}</Text> All payments made through the app are subject to our payment policy. We are not responsible for cancellations or refunds outside our stated policy.
            </Text>
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              4. <Text className="font-semibold">{`Content:`}</Text> All content provided in the app is for informational purposes only. Unauthorized use of content is strictly prohibited.
            </Text>
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              5. <Text className="font-semibold">{`Limitation of Liability:`}</Text> We are not liable for any direct or indirect damages arising from the use of our app.
            </Text>
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              6. <Text className="font-semibold">{`Changes to Terms:`}</Text> We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of the updated terms.
            </Text>
            <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>
              7. <Text className="font-semibold">{`Contact:`}</Text> For any questions regarding these terms, please contact our support team through the app.
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

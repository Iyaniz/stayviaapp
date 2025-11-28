import React from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
          <Text className={`text-2xl font-bold ${textPrimary}`}>Terms and Conditions</Text>
        </View>


        {/* Terms and Conditions */}
        <Card className={`${cardColor} mt-2`}>
          <CardHeader>
            {/* <CardTitle className={textPrimary}>Terms and Conditions</CardTitle> */}
            <CardDescription className={`${textSecondary} dark:text-gray-200`}>
              Last Updated: November 4, 2025
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-1">
            <Text className={`text-sm ${textSecondary} mb-3`}>
              Welcome to <Text className="font-semibold">StayVia</Text>! These Terms and Conditions (“Terms”) govern your use of our mobile 
              application and related services (“App” or “Services”). By accessing or using StayVia, you agree to these Terms. 
              If you do not agree, please discontinue use of the App.
            </Text>

            {/* User Responsibilities */}
            <Text className={`text-base font-semibold ${textPrimary}`}>User Responsibilities</Text>
            <Text className={`text-sm ${textSecondary}`}>
              By using StayVia, you agree to:
            </Text>
            <Text className={`text-sm ${textSecondary}`}>• Provide accurate, truthful, and updated information.</Text>
            <Text className={`text-sm ${textSecondary}`}>• Use the App only for its intended purpose (finding or listing accommodations).</Text>
            <Text className={`text-sm ${textSecondary}`}>• Not engage in harmful, misleading, or illegal activities (e.g., fraud, harassment, false listings).</Text>
            <Text className={`text-sm ${textSecondary}`}>• Respect the rights and privacy of other users.</Text>

            {/* Listings and Content */}
            <Text className={`text-base font-semibold ${textPrimary} mt-3`}>Listings and Content</Text>
            <Text className={`text-sm ${textSecondary}`}>• Property listings must be accurate and not misleading.</Text>
            <Text className={`text-sm ${textSecondary}`}>• StayVia reserves the right to review, approve, or remove listings that violate our policies.</Text>
            <Text className={`text-sm ${textSecondary}`}>• Users are solely responsible for the content they post (text, images, or messages).</Text>

            {/* Messaging */}
            <Text className={`text-base font-semibold ${textPrimary} mt-3`}>Messaging and Communication</Text>
            <Text className={`text-sm ${textSecondary}`}>• The in-app messaging feature is for communication between students and property owners.</Text>
            <Text className={`text-sm ${textSecondary}`}>• Do not use messaging to spam, scam, or harass others.</Text>
            <Text className={`text-sm ${textSecondary}`}>• StayVia may monitor or restrict messaging for safety and security reasons.</Text>

            {/* Limitations */}
            <Text className={`text-base font-semibold ${textPrimary} mt-3`}>Limitations of Liability</Text>
            <Text className={`text-sm ${textSecondary}`}>
              StayVia is a platform only. We are not landlords, property managers, or agents. We do not guarantee rental 
              agreements, payments, or living conditions. To the maximum extent permitted by law:
            </Text>
            <Text className={`text-sm ${textSecondary}`}>• StayVia is not liable for damages, losses, or disputes arising from the use of the App.</Text>
            <Text className={`text-sm ${textSecondary}`}>• Users are responsible for their own decisions and actions.</Text>

            {/* Privacy Reference */}
            <Text className={`text-base font-semibold ${textPrimary} mt-3`}>Privacy</Text>
            <Text className={`text-sm ${textSecondary}`}>
              Your privacy is important to us. Please review our <Text className="font-semibold">Privacy Policy</Text> to understand how we collect, use, and protect your data.
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

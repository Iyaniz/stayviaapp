import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeatherIcon from "@expo/vector-icons/Feather";

export default function AboutUs() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bgColor = isDark ? "bg-black" : "bg-gray-100";
  const cardColor = isDark ? "bg-neutral-800" : "bg-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-700";
  const iconColor = isDark ? "#fff" : "#1f2937";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={["top", "bottom"]}>
      <ScrollView className="px-5 py-6">

        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.push("/account")}
            className={`w-10 h-10 rounded-full items-center justify-center ${cardColor} mr-4`}
          >
            <FeatherIcon name="chevron-left" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${textColor}`}>
            About Us
          </Text>
        </View>

        {/* About Section */}
        <Text className={`text-base ${textSecondary} mb-4 leading-7`}>
          <Text className="font-semibold">StayVia</Text> is a platform designed for USTP students to find verified rental accommodations. 
          We provide tools such as property listings, basic mapping, messaging, and due reminders. 
          StayVia does not own or manage any rental properties.
        </Text>

        <Text className={`text-base ${textSecondary} mb-4 leading-7`}>
          Our mission is to connect students with safe, affordable, and convenient places to stay near the 
          University of Science and Technology of Southern Philippines (USTP). We aim to create a trusted 
          environment for both students and landlords through a smooth, transparent, and reliable rental experience.
        </Text>

        <Text className={`text-base ${textSecondary} mb-4 leading-7`}>
          With StayVia, you can explore listings, view photos, check amenities, and directly message landlords. 
          Our team is committed to maintaining a platform that’s user-friendly, secure, and accessible to all students.
        </Text>
        <Text className={`text-lg font-semibold ${textColor} mt-6 mb-2`}>
          Eligibility
        </Text>
        <View className="pl-3 mb-6">
          <Text className={`text-base ${textSecondary} leading-7`}>
            • You must be a student of the <Text className="font-semibold">University of Science and Technology of Southern Philippines (USTP)</Text> to use StayVia.
          </Text>
          <Text className={`text-base ${textSecondary} leading-7`}>
            • You must be a verified user as determined by StayVia’s verification requirements.
          </Text>
          <Text className={`text-base ${textSecondary} leading-7`}>
            • You are responsible for keeping your account details secure at all times.
          </Text>
        </View>

        {/* Contact Section */}
        <Text className={`text-base font-semibold ${textColor} mb-2`}>
          Get in Touch
        </Text>
        <Text className={`text-base ${textSecondary} mb-1`}>
          Email: support@stayvia.com
        </Text>
        <Text className={`text-base ${textSecondary}`}>
          Phone: +63 912 345 6789
        </Text>
        <Text className={`text-base font-semibold ${textColor} mb-2`}>
          {/* Get in Touch */}
        </Text>
        <Text className={`text-base ${textSecondary} mb-1`}>
          {/* Email: support@stayvia.com */}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

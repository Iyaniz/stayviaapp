import React from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";

const faqs = [
  {
    title: "How do I book a room?",
    content: "Browse listings, select your desired accommodation, and follow the booking instructions. You can also contact the landlord directly from the app.",
  },
  {
    title: "Can I cancel my booking?",
    content: "Yes, you can cancel a booking. Cancellation policies vary by host, so check the listing details before confirming.",
  },
  {
    title: "Is my payment secure?",
    content: "Absolutely! All payments are processed securely through our trusted payment gateway.",
  },
  {
    title: "How do I report a problem?",
    content: "Go to the 'Contact Support' section under Help & Support and submit your issue. Our team will respond promptly.",
  },
];

export default function HelpFAQs() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  // Dynamic colors
  const bgColor = isDark ? "bg-black" : "bg-gray-100";
  const cardColor = isDark ? "bg-neutral-800" : "bg-white";
  const textPrimary = isDark ? "text-white" : "text-gray-800";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-700";
  const iconColor = isDark ? "#fff" : "#1f2937";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header: Back Button + Title */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.push("/(profile)/settings")}
            className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-gray-200"} mr-4`}
          >
            <FeatherIcon name="chevron-left" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${textPrimary}`}>Help & FAQs</Text>
        </View>

        <Accordion type="single" collapsible>
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className={`rounded-xl shadow-md mb-3 ${cardColor}`}
            >
              <AccordionTrigger className="px-4">
                <Text className={`text-base font-medium ${textPrimary}`}>{faq.title}</Text>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <Text className={`text-sm ${textSecondary} dark:text-gray-200`}>{faq.content}</Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollView>
    </SafeAreaView>
  );
}

import ScreenWrapper from "@/components/ScreenWrapper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, FlatList, TouchableOpacity, Image, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import posts from "@/assets/data/posts.json";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Expandable text component
function ExpandableText({ text, limit = 100 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= limit) {
    return <Text style={{ fontSize: 14, color: "#6B7280" }}>{text}</Text>;
  }

  return (
    <View>
      <Text style={{ fontSize: 14, color: "#6B7280" }}>
        {expanded ? text : text.slice(0, limit) + "..."}
      </Text>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={{ fontSize: 12, color: "#2563EB", marginTop: 4, fontWeight: "500" }}>
          {expanded ? "See less" : "See more"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Review() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" }}>
        <Text style={{ color: isDarkMode ? "#FFF" : "#111827" }}>Post not found</Text>
      </SafeAreaView>
    );
  }

  const colors = {
    background: isDarkMode ? "#121212" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#D1D5DB" : "#6B7280",
    cardBg: isDarkMode ? "#1F1F1F" : "#F9FAFB",
    starFilled: "#FACC15",
    starEmpty: isDarkMode ? "#4B5563" : "#D1D5DB",
    link: "#2563EB",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          <Text style={{ marginLeft: 4, fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>Reviews</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: colors.textPrimary }}>{post.title}</Text>

        {/* Reviews List */}
        <FlatList
          data={post.reviewsList || []}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ width: "100%", marginBottom: 20, padding: 16, backgroundColor: colors.cardBg, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                {/* Avatar */}
                <Image
                  source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.user}` }}
                  style={{ width: 40, height: 40, borderRadius: 999, marginRight: 12 }}
                />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>{item.user}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < item.rating ? "star" : "star-outline"}
                        size={16}
                        color={i < item.rating ? colors.starFilled : colors.starEmpty}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Collapsible review text */}
              <ExpandableText text={item.comment} limit={120} />
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>No reviews yet.</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

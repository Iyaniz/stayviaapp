import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import { HorizontalPostCard } from "@/components/home/HorizontalPostCard";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/lib/theme"; 
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/userService";
import { useSupabase } from "@/lib/supabase";
import { fetchPostsByUserId } from "@/services/postService";
import DownloadImage from "@/components/download/downloadImage";
import { useUser } from "@clerk/clerk-expo";


export default function ProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme(); 
  const supabase = useSupabase();
  const {user: userLog} = useUser();

  const userId = userLog?.id as string;
  
  const {data, isLoading, error} = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostsByUserId(id as string, supabase),
    enabled: !!id,
  });

  const isOwnPost = userId === id;

  const {data: user, isLoading: userLoading, error: userError} = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string, supabase),
    enabled: !!id,
  });

  // console.log(JSON.stringify(user, null, 2))
  const defaultAvatar = "https://i.pravatar.cc/150";
  const avatarUrl =
    !user?.avatar || user?.avatar.includes("clerk.dev/static")
      ? defaultAvatar
      : user?.avatar;
  

  if (isLoading || userLoading) {
    return (
      <SafeAreaView style={[styles.flex1, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Skeleton style={{ width: 36, height: 36, borderRadius: 18 }} />
          <Skeleton style={{ width: 80, height: 20, borderRadius: 6 }} />
          <Skeleton style={{ width: 36, height: 36, borderRadius: 18 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.row, { marginTop: 24, marginBottom: 16 }]}>
            <Skeleton style={{ width: 64, height: 64, borderRadius: 32 }} />
            <View style={{ flex: 1 }}>
              <Skeleton style={{ width: "60%", height: 24, borderRadius: 6, marginBottom: 8 }} />
              <Skeleton style={{ width: "40%", height: 16, borderRadius: 6, marginBottom: 6 }} />
              <Skeleton style={{ width: "50%", height: 16, borderRadius: 6 }} />
            </View>
          </View>
          <Skeleton style={{ width: 60, height: 16, borderRadius: 4, marginTop: 12, marginBottom: 16 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                style={{
                  width: 250,
                  height: 300,
                  borderRadius: 12,
                  marginRight: 12,
                }}
              />
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || userError || !user) {
    return (
      <SafeAreaView
        style={[
          styles.flex1,
          styles.center,
          { backgroundColor: colors.background },
        ]}
        edges={["top", "left", "right"]}
      >
        <Text style={{ color: colors.foreground }}>User not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex1, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: colors.secondary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.foreground,
            fontSize: 18,
            fontWeight: "600",
          }}
          className="mr-2"
        >
          User Profile
        </Text>

        {!isOwnPost && <TouchableOpacity
          onPress={() => router.push(`/(chat)/chat`)}
          style={[styles.iconButton, { backgroundColor: colors.secondary }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>}
      </View>

      <ScrollView>
        {/* User Info */}
        <View style={[styles.row, { marginTop: 24, marginBottom: 16, paddingHorizontal: 16 }]}>
          { user.avatar? (
              <DownloadImage
                path={user.avatar}
                supabase={supabase}
                fallbackUri={avatarUrl}
                style={{ width: 70, height: 70, borderRadius: 50, marginRight: 12 }}
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-gray-300 mr-3" />
            )}
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>
              {user.firstname || user.lastname
                ? `${user.firstname} ${user.lastname}`.trim()
                : user.username}
            </Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
              @{user.username?.toLowerCase() || "N/A"}
            </Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
              {user.email?.toLowerCase() || "N/A"}
            </Text>
          </View>
        </View>

        {/* User Posts */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              textTransform: "uppercase",
              color: colors.mutedForeground,
              marginBottom: 8,
            }}
          >
            Posts
          </Text>
          {data?.length === 0 ? (
            <View
              style={{
                width: "100%",
                height: 208,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.secondary,
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <Ionicons
                name="albums-outline"
                size={48}
                color={colors.mutedForeground}
              />
              <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>
                No posts yet
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 12,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                This user hasn't shared any posts.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {data?.map((post) => (
                <HorizontalPostCard
                  key={post.id}
                  post={{
                    ...post
                    // user: post.post_user === null ? undefined : post.post_user,
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Feedback Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              textTransform: "uppercase",
              color: colors.mutedForeground,
              marginBottom: 8,
            }}
          >
            Feedbacks
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

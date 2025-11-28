import React from "react";
import { FlatList, View, Text, ActivityIndicator } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import ChannelListItem from "@/components/ChannelListItem";
import { Database } from "@/types/database.types";
import { useAppTheme } from "@/lib/theme";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type ConversationParticipant = Database["public"]["Tables"]["conversation_participants"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

// 🔹 Fetch all conversations for the logged-in user
async function getUserConversations(
  supabase: ReturnType<typeof useSupabase>,
  userId: string
) {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(
      `
      conversation_id,
      conversations!inner(id, created_at),
      user_id,
      users!conversation_participants_user_id_fkey(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const conversationIds = data.map((p) => p.conversation_id);
  if (conversationIds.length === 0) return [];

  const { data: allParticipants, error: partError } = await supabase
    .from("conversation_participants")
    .select(`conversation_id, user_id, users!conversation_participants_user_id_fkey(*)`)
    .in("conversation_id", conversationIds);

  if (partError) throw partError;

  return conversationIds.map((convId) => {
    const participants = allParticipants.filter((p) => p.conversation_id === convId);
    const other = participants.find((p) => p.user_id !== userId)?.users;
    return {
      id: convId,
      otherUser: other,
    };
  });
}

export default function ChannelListScreen() {
  const { user } = useUser();
  const supabase = useSupabase();
  const { colors } = useAppTheme(); // 🔹 central theme hook

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => getUserConversations(supabase, user!.id),
    enabled: !!user?.id,
  });

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (error)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.foreground }}>Error loading conversations</Text>
      </View>
    );

  if (!conversations?.length)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.foreground }}>No conversations yet</Text>
      </View>
    );

  return (
    <FlatList
      data={conversations}
      style={{ backgroundColor: colors.background }}
      keyExtractor={(item) => item.id ?? ""}
      renderItem={({ item }) => (
        <ChannelListItem
          channel={{
            id: item.id as string,
            name: `${item.otherUser?.firstname ?? ""} ${item.otherUser?.lastname ?? ""}`,
            avatar: item.otherUser?.avatar ?? "",
          }}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}

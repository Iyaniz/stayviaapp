

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/lib/supabase";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { subscribeToMessages, Message } from "@/services/conversationService";
import DownloadImage from "@/components/download/downloadImage";

import { Ionicons } from '@expo/vector-icons';

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const supabase = useSupabase();
  const { channelData } = useLocalSearchParams<{ channelData: string }>();
  const channel = channelData ? JSON.parse(channelData) : null;

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const otherUserName = params.name;
  const otherUserAvatar = params.avatar ?? "";

  const defaultAvatar = "https://i.pravatar.cc/150";
  const avatarUrl =
    !user?.imageUrl || user.imageUrl.includes("clerk.dev/static")
      ? defaultAvatar
      : user.imageUrl;


  useEffect(() => {
    if (!id || !user) return;

    fetchConversation();
    fetchMessages();

    // Subscribe for live updates
    const subscription = subscribeToMessages(supabase, id, (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev; // prevent duplicates
        return [...prev, msg];
      });
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, user]);

  const fetchConversation = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching conversation:", error.message);
      return;
    }

    setConversation(data);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
    } else {
      setMessages(data || []);
    }

    setLoading(false);
  };

  const handleNewMessage = (msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev; // prevent duplicates
      return [...prev, msg];
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!conversation) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Conversation not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          // title: channel?.name ?? otherUserName ?? "User",
          // headerTitleAlign: "center",
          headerLeft: () => (
            <>
              <Link href='/chat' asChild>
              <Ionicons name='arrow-back' size={28} className='px-3' color='gray' />
            </Link>
            <DownloadImage
              path={channel?.avatar ?? otherUserAvatar }
              supabase={supabase}
              fallbackUri={avatarUrl} 
              className="rounded-full"
              style={{height: 42, width: 42}}
            />
            <Text className="text-lg ml-2 font-semibold" >{channel?.name ?? otherUserName ?? "User"}</Text>
            </>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <SafeAreaView edges={["bottom"]} className="flex-1">
          <MessageList messages={messages} currentUserId={user?.id} />
          <MessageInput conversationId={id} onNewMessage={handleNewMessage} />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

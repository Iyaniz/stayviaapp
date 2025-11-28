import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessages, Message, sendMessage, subscribeToMessages } from "@/services/conversationService";

export default function ConversationPage() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState("");

  // 🧠 Fetch all messages for this conversation
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(supabase, conversationId),
    enabled: !!conversationId,
  });

  // 📨 Send message mutation
  const { mutate: handleSendMessage, isPending: sending } = useMutation({
    mutationFn: async () => {
      if (!user?.id || !newMessage.trim()) return;
      await sendMessage(supabase, conversationId, user.id, newMessage.trim());
      setNewMessage("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  // 🔁 Subscribe to new messages in realtime
  useEffect(() => {
    if (!conversationId) return;

    const subscription = subscribeToMessages(
      supabase,
      conversationId,
      (msg) => {
        queryClient.setQueryData<Message[]>(
          ["messages", conversationId],
          (old = []) => [...old, msg]
        );
      }
    );

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId]);

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  if (error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error loading messages</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Message list */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMine = item.sender_id === user?.id;
          return (
            <View
              className={`p-2 my-1 mx-3 rounded-2xl max-w-[80%] ${
                isMine ? "self-end bg-blue-500" : "self-start bg-gray-200"
              }`}
            >
              <Text
                className={`text-base ${isMine ? "text-white" : "text-black"}`}
              >
                {item.content}
              </Text>
            </View>
          );
        }}
      />

      {/* Input box */}
      <View className="flex-row items-center p-3 border-t border-gray-300">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={() => handleSendMessage()}
          disabled={!newMessage.trim() || sending}
          className={`ml-2 px-4 py-2 rounded-full ${
            sending || !newMessage.trim() ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text className="text-white font-semibold">
            {sending ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

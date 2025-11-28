import React from "react";
import { FlatList } from "react-native";
import MessageListItem from "./MessageListItem";
import { Message } from "@/services/conversationService";

type MessageListProps = {
  messages: Message[];
  currentUserId?: string;
};

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <FlatList
      data={messages.slice().reverse()} // reverse for inverted scrolling
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageListItem message={item} isOwnMessage={item.sender_id === currentUserId} />
      )}
      inverted // newest messages at bottom
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

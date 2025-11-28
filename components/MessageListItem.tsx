import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import React, { useState } from "react";
import { View, Text, Pressable, Modal, Image, TouchableOpacity } from "react-native";
import DownloadImgMsg from "./download/downloadImgMsg";
import { useSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { Database } from "@/types/database.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type MessageListItemProps = {
  message: MessageRow;
  isOwnMessage?: boolean;
};

export default function MessageListItem({
  message,
  isOwnMessage = false,
}: MessageListItemProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false); // modal state

  const { user } = useUser();
  const supabase = useSupabase();

  const defaultAvatar = "https://i.pravatar.cc/150";
  const avatarUrl =
    !user?.imageUrl || user?.imageUrl.includes("clerk.dev/static")
      ? defaultAvatar
      : user?.imageUrl;

  const hasImage = Boolean(message.image_path);
  const hasText = Boolean(message.content);

  const toggleTimestamp = () => setShowTimestamp((prev) => !prev);

  return (
    <>
      <Pressable
        onPress={toggleTimestamp}
        className={`flex-row mb-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <View className={`max-w-[75%] gap-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
          {/* 🖼️ Image message */}
          {hasImage && message.image_path && (
            <Pressable onPress={() => setFullscreenVisible(true)}>
              <View className="w-32 h-32 bg-gray-100 rounded overflow-hidden">
                <DownloadImgMsg
                  path={message.image_path}
                  supabase={supabase}
                  fallbackUri={avatarUrl}
                  className="w-32 h-32 rounded"
                />
              </View>
            </Pressable>
          )}

          {/* 💬 Text bubble */}
          {hasText && message.content && (
            <View
              className={`rounded-2xl px-4 py-2 ${
                isOwnMessage ? "bg-blue-500 rounded-br-md" : "bg-gray-200 rounded-bl-md"
              }`}
            >
              <Text className={`${isOwnMessage ? "text-white" : "text-neutral-900"}`}>
                {message.content}
              </Text>
            </View>
          )}

          {/* ⏱️ Timestamp */}
          {showTimestamp && message.created_at && (
            <Text className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Fullscreen image modal */}
      {hasImage && (
        <Modal visible={fullscreenVisible} transparent={true}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setFullscreenVisible(false)}
          >
            <DownloadImgMsg
              path={message.image_path}
              supabase={supabase}
              fallbackUri={avatarUrl}
              style={{ width: "90%", height: "90%", borderRadius: 10 }}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

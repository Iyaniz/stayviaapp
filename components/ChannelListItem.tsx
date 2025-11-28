import { Channel } from "@/types";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import DownloadImage from "./download/downloadImage";
import { useSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { useAppTheme } from "@/lib/theme";

type ChannelListItemProps = {
  channel: Channel;
};

type LastMessage = {
  content: string | null;
  created_at: string | null;
  image_path?: string | null;
};

export default function ChannelListItem({ channel }: ChannelListItemProps) {
  const supabase = useSupabase();
  const { user } = useUser();
  const { colors } = useAppTheme();
  const defaultAvatar = "https://i.pravatar.cc/150";

  const [lastMessage, setLastMessage] = useState<LastMessage | null>(null);

  const avatarUrl: string =
    !user?.imageUrl || user?.imageUrl.includes("clerk.dev/static")
      ? defaultAvatar
      : user.imageUrl;

  // Fetch last message
  useEffect(() => {
    const fetchLastMessage = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("content, created_at, image_path")
        .eq("conversation_id", channel.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setLastMessage(data);
      }
    };

    fetchLastMessage();
  }, [channel.id, supabase]);

  // Determine the message preview
  const getMessagePreview = () => {
    if (!lastMessage) return "No messages yet";

    if (lastMessage.image_path) {
      return "Sent an image.";
    }

    if (lastMessage.content && lastMessage.content.trim() !== "") {
      return lastMessage.content;
    }

    return "No content";
  };

  return (
    <Link
      href={{
        pathname: "/(channel)/[id]",
        params: { id: channel.id, channelData: JSON.stringify(channel) },
      }}
      asChild
    >
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        {/* Avatar */}
        <DownloadImage
          path={channel.avatar}
          supabase={supabase}
          fallbackUri={defaultAvatar}
          style={{ width: 50, height: 50, borderRadius: 50, marginRight: 12 }}
        />

        {/* Name & last message */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: colors.foreground,
            }}
            numberOfLines={1}
          >
            {channel.name || "Unknown User"}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
            }}
            numberOfLines={1}
          >
            {getMessagePreview()}
          </Text>
        </View>

        {/* Last message time */}
        {lastMessage?.created_at && (
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            {formatDistanceToNow(new Date(lastMessage.created_at), {
              addSuffix: true,
            })}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}

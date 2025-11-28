import React from "react";
import { View, Text, Pressable } from "react-native";
import { User } from "@/services/userService";
import DownloadImage from "./download/downloadImage";
import { useSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { useAppTheme } from "@/lib/theme";

type Props = {
  user: User;
  onPress?: (user: User) => void;
};

export default function UserListItem({ user, onPress }: Props) {
  const supabase = useSupabase();
  const { user: userLog } = useUser();
  const { colors } = useAppTheme();

  const defaultAvatar = "https://i.pravatar.cc/150";
  const avatarUrl =
    !userLog?.imageUrl || userLog.imageUrl.includes("clerk.dev/static")
      ? defaultAvatar
      : userLog.imageUrl;

  return (
    <Pressable
      onPress={() => onPress?.(user)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
        gap: 12,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.accentForeground,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {user.avatar ? (
          <DownloadImage
            path={user.avatar}
            supabase={supabase}
            fallbackUri={avatarUrl}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
        ) : (
          <Text style={{ color: colors.mutedForeground, fontWeight: "bold", fontSize: 16 }}>
            {user.firstname?.charAt(0).toUpperCase() ||
              user.username.charAt(0).toUpperCase()}
          </Text>
        )}

        {/* Online status */}
        {!user.online && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: 10,
              backgroundColor: "green",
              borderWidth: 1,
              borderColor: colors.card,
            }}
          />
        )}
      </View>

      {/* Name & account type */}
      <View>
        <Text style={{ color: colors.foreground, fontWeight: "500" }}>
          {user.firstname && user.lastname
            ? `${user.firstname} ${user.lastname}`
            : user.username}
        </Text>
        {user.account_type && (
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            {user.account_type}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

import React from "react";
import { FlatList, View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/supabase";
import { fetchUsers, User } from "@/services/userService";
import UserListItem from "./UserListItem";
import { useUser } from "@clerk/clerk-expo";
import { useAppTheme } from "@/lib/theme";

type UserListProps = {
  onPress?: (user: User) => void;
};

export default function UserList({ onPress }: UserListProps) {
  const supabase = useSupabase();
  const { user } = useUser();
  const { colors } = useAppTheme();


  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(supabase),
  });

  // Exclude the current logged-in user
  const filteredUsers = users?.filter((u) => u.id !== user?.id) || [];

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
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
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.foreground }}>Error loading users</Text>
      </View>
    );

  if (!filteredUsers.length)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.foreground }}>No users found</Text>
      </View>
    );

  return (
    <FlatList
      data={filteredUsers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserListItem user={item} onPress={onPress} />}
      contentContainerStyle={{ backgroundColor: colors.background }}
    />
  );
}

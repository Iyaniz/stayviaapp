import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import UserList from "@/components/UserList";
import { Database } from "@/types/database.types";
import { useSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { getOrCreateConversation } from "@/services/conversationService";
import { useMutation } from "@tanstack/react-query";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function NewChat() {
  const router = useRouter();
  const supabase = useSupabase();
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (selectedUser: User) => {
      if (!user?.id) throw new Error("User not logged in");
      return getOrCreateConversation(supabase, user.id, selectedUser.id);
    },
    onSuccess: (conversation, selectedUser: User) => {
      // Pass both conversationId and the other user as params
      router.push(
        `/(channel)/${conversation.id}?name=${selectedUser.firstname}%20${selectedUser.lastname}&avatar=${selectedUser.avatar ?? ""}`
      );
    },
    onError: (error: any) => {
      console.error("Error creating or fetching conversation:", error.message);
      Alert.alert("Error", "Failed to start chat. Please try again.");
    },
  });

  // Fetch all users excluding the current logged-in user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .neq("id", user.id);

      if (error) console.error("Error fetching users:", error.message);
      else setUsers(data || []);
    };

    fetchUsers();
  }, [user?.id, supabase]);

  return (
    <View className="flex-1 bg-black/20">
      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-black/20">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <UserList onPress={(user) => mutate(user)} />
    </View>
  );
}

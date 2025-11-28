import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Separator } from "../ui/separator";
import { Database } from "@/types/database.types";
import DownloadImage from "../download/downloadImage";
import { useSupabase } from "@/lib/supabase";
import DownloadPostImages from "../download/downloadPostImages";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFavorite, deleteFavorite } from "@/services/favorites";
import { deletePost } from "@/services/postService";
import { AlertDialog } from "../ui/alert-dialog";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { format } from "date-fns";
import { differenceInDays } from "date-fns/differenceInDays";

type PostWithUser = Database["public"]["Tables"]["posts"]["Row"] & {
  post_user: Database["public"]["Tables"]["users"]["Row"] | null;
};

type PostCardProps = {
  post: PostWithUser;
  user_id?: string;
};

export function HorizontalPostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const defaultAvatar = "https://i.pravatar.cc/150";
  const avatarUrl =
    !post.post_user?.avatar || post.post_user?.avatar.includes("clerk.dev/static")
      ? defaultAvatar
      : post.post_user?.avatar;

  const maxChars = 70;
  const description = post.description ?? "";
  const truncated = description.length > maxChars;
  const displayText = expanded
    ? description
    : truncated
    ? description.slice(0, maxChars) + "..."
    : description;

  const user_id = user?.id;
  const isOwnPost = user_id === post.post_user?.id;
  const createdAt = post.created_at ? new Date(post.created_at) : null;
  let timeAgo = "";
  let dateDisplay = "";

if (createdAt) {
  timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
  const daysDiff = differenceInDays(new Date(), createdAt);
  if (daysDiff >= 1) {
    // Only show the date if it's at least a day old
    dateDisplay = ` · ${format(createdAt, "MMM d, yyyy")}`;
  }
}



  useEffect(() => {
    const fetchFavorite = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", post.id)
        .maybeSingle();
      if (data) setIsFavorited(true);
    };
    fetchFavorite();
  }, [user?.id, post.id]);

  const addFavoriteMutation = useMutation({
    mutationFn: async () =>
      insertFavorite({ post_id: post.id, user_id: user?.id, favorited: true }, supabase),
    onMutate: () => setIsFavorited(true),
    onError: () => setIsFavorited(false),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => deleteFavorite(post.id, user_id as string, supabase),
    onMutate: () => setIsFavorited(false),
    onError: () => setIsFavorited(true),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const handleToggleFavorite = () => {
    if (!user?.id) return;
    if (isFavorited) removeFavoriteMutation.mutate();
    else addFavoriteMutation.mutate();
  };

  const deletePostMutation = useMutation({
    mutationFn: async () => deletePost(post.id, user_id as string, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setConfirmVisible(false);
    },
  });

  const handleDeletePost = () => setConfirmVisible(true);
  const handleOpenPost = () => router.push(`/(post)/${post.id}`);
  const confirmDelete = () => deletePostMutation.mutate();

  // Heart animation
  const scale = new Animated.Value(1);
  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Card
      className="w-72 mr-3 p-0 overflow-hidden shadow-sm"
      style={{
        alignSelf: "stretch",
        flexShrink: 1,
        height: "auto",
        minHeight: post.image ? 460 : 320, // dynamic max heights
        
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // ensures footer sticks to bottom
      }}
    >
  {/* Header + Content */}
  <View style={{ flexShrink: 1 }}>
    <CardHeader className="px-3 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.push(`/(user)/${post.post_user?.id}`)}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            {post.post_user?.avatar ? (
              <DownloadImage
                path={post.post_user.avatar}
                supabase={supabase}
                fallbackUri={defaultAvatar}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-gray-300 mr-3" />
            )}
            <View className="flex justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {post.post_user
                    ? `${post.post_user.firstname ?? ""} ${post.post_user.lastname ?? ""}`.trim()
                    ||
                    post.post_user.username
                    : "Unknown User"}
                </Text>

                {post.post_user?.account_type === "landlord" ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#3B82F6"
                    style={{ marginLeft: 6 }}
                  />
                ) : (
                  <Text className="text-xs text-gray-500 ml-1">
                    ({post.post_user?.account_type})
                  </Text>
                )}
              </View>
              <Text className="text-xs text-gray-500">
                {timeAgo} {dateDisplay}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleOpenPost}
              className="p-2"
            >
              <AntDesign name="eyeo" size={20} color="#667EEA" />
            </TouchableOpacity>

            {isOwnPost && (
              <TouchableOpacity onPress={handleDeletePost} className="p-2">
                <Ionicons name="trash" size={20} color="#667EEA" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <CardTitle className="text-base mt-1">{post.title}</CardTitle>

        {description ? (
          <View className="mt-1">
            <Text
              className="text-sm text-gray-800 dark:text-gray-100"
              numberOfLines={expanded ? undefined : 2}
            >
              {displayText}
            </Text>
            {truncated && (
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text className="text-xs text-blue-600 mb-[-18px]">
                  {expanded ? "See less" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
    </CardHeader>

    {post.image && (
      <CardContent className="px-0 mt-2">
        <TouchableOpacity onPress={() => setFullScreenImageVisible(true)}>
          <DownloadPostImages
            path={post.image}
            supabase={supabase}
            fallbackUri={avatarUrl}
            className="w-full h-52 rounded"
          />
        </TouchableOpacity>
      </CardContent>
    )}

    {post.image ? <Separator className="my-0" /> : <View className="mt-1" />}
  </View>

  {/* Footer (heart icon) sticks at bottom */}
  <CardFooter className="flex-row items-center justify-end px-4 pb-3 pt-1">
    <TouchableOpacity
      onPress={() => {
        handleToggleFavorite();
        animateHeart();
      }}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isFavorited ? "heart" : "heart-outline"}
          size={26}
          color={isFavorited ? "#ef4444" : "#9ca3af"}
        />
      </Animated.View>
    </TouchableOpacity>
  </CardFooter>

  {/* Modals */}
  <Modal
    visible={fullScreenImageVisible}
    transparent
    onRequestClose={() => setFullScreenImageVisible(false)}
  >
    <TouchableOpacity
      className="flex-1 bg-black justify-center items-center"
      onPress={() => setFullScreenImageVisible(false)}
      activeOpacity={1}
    >
      <DownloadPostImages
        path={post.image}
        supabase={supabase}
        fallbackUri={avatarUrl}
        className="w-full h-52 rounded"
      />
    </TouchableOpacity>
  </Modal>

  <AlertDialog
    visible={confirmVisible}
    title="Delete Post"
    message="Are you sure you want to delete this post?"
    confirmText="Delete"
    cancelText="Cancel"
    destructive
    onConfirm={confirmDelete}
    onCancel={() => setConfirmVisible(false)}
  />
</Card>

  );
}

export function HorizontalPostList({ posts }: { posts: PostWithUser[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2">
      {posts.map((p) => (
        <HorizontalPostCard key={p.id} post={p} />
      ))}
    </ScrollView>
  );
}

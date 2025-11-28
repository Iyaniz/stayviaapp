import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
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
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { Separator } from "../ui/separator";
import DownloadImage from "../download/downloadImage";
import DownloadPostImages from "../download/downloadPostImages";
import { useSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFavorite, deleteFavorite } from "@/services/favorites";
import { Database } from "@/types/database.types";
import { deletePost } from "@/services/postService";
import { AlertDialog } from "../ui/alert-dialog";

type PostWithUser = Database["public"]["Tables"]["posts"]["Row"] & {
  post_user: Database["public"]["Tables"]["users"]["Row"] | null;
};

type PostCardProps = { post: PostWithUser };

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const defaultAvatar = "https://i.pravatar.cc/150";
  const avatarUrl =
    !post.post_user?.avatar || post.post_user?.avatar.includes("clerk.dev/static")
      ? defaultAvatar
      : post.post_user?.avatar;


  const [isFavorited, setIsFavorited] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false); 

  useEffect(() => {
    const fetchFavorite = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", post.id)
        .maybeSingle();

      if (!error && data) setIsFavorited(true);
    };
    fetchFavorite();
  }, [user?.id, post.id]);

  const addFavoriteMutation = useMutation({
    mutationFn: async () =>
      insertFavorite(
        { post_id: post.id, user_id: user?.id, favorited: true },
        supabase
      ),
    onMutate: () => setIsFavorited(true),
    onError: () => setIsFavorited(false),
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const user_id = user?.id;
  const removeFavoriteMutation = useMutation({
    mutationFn: async () =>
      deleteFavorite(post.id, user_id as string, supabase),
    onMutate: () => setIsFavorited(false),
    onError: () => setIsFavorited(true),
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const handleToggleFavorite = () => {
    if (!user?.id) return;
    if (isFavorited) removeFavoriteMutation.mutate();
    else addFavoriteMutation.mutate();
  };

  const createdAt = post.created_at ? new Date(post.created_at) : null;
  const timeAgo = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : "";

  const description = post.description ?? "";
  const maxChars = 100;
  const shouldTruncate = description.length > maxChars;
  const displayText = expanded
    ? description
    : shouldTruncate
    ? description.slice(0, maxChars) + "..."
    : description;

  const handleOpenPost = () => router.push(`/(post)/${post.id}`);
  const handleOpenUser = () => {
    if (post.post_user?.id) router.push(`/(user)/${post.post_user.id}`);
  };

  const isOwnPost = user_id === post.post_user?.id;

  // ✅ Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => deletePost(post.id, user_id as string, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setConfirmVisible(false);
    },
  });

  const handleDeletePost = () => setConfirmVisible(true);
  const confirmDelete = () => deletePostMutation.mutate();

  return (
    <Card className="w-full p-0 overflow-hidden shadow-sm mb-2">
      <CardHeader className="px-0 pt-4 pb-0">
        <View className="flex-row justify-between items-center px-4">
          <TouchableOpacity
            onPress={handleOpenUser}
            className="flex-row items-center flex-shrink"
            activeOpacity={0.7}
          >
            {post.post_user?.avatar ? (
              <DownloadImage
                path={post.post_user.avatar}
                supabase={supabase}
                fallbackUri={avatarUrl}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-gray-300 mr-3" />
            )}
            <View className="flex justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {post.post_user
                    ? `${post.post_user.firstname ?? ""} ${post.post_user.lastname ?? ""}`.trim() ||
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
                {timeAgo} · {createdAt ? format(createdAt, "MMM d, yyyy") : ""}
              </Text>
            </View>


          </TouchableOpacity>

          <View className="flex-row">
            <TouchableOpacity onPress={handleOpenPost} className="p-2">
              <AntDesign name="eyeo" size={20} color="#667EEA" />
            </TouchableOpacity>
            {isOwnPost && (
              <TouchableOpacity onPress={handleDeletePost} className="p-2">
                <Ionicons name="trash" size={20} color="#667EEA" />
              </TouchableOpacity>
            )}
          </View>

        </View>

        <CardTitle className="text-base px-4 mt-3">{post.title}</CardTitle>

        {description.length > 0 && (
          <View className="mt-1 px-4">
            <Text className="text-sm text-gray-800 dark:text-gray-100">
              {displayText}
            </Text>
            {shouldTruncate && (
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text className="text-xs text-blue-600 mt-1">
                  {expanded ? "See less" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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

      <Separator className="my-1" />

      <CardFooter className="flex-row items-center justify-center px-4 pb-3">
        <TouchableOpacity
          onPress={handleToggleFavorite}
          className="flex-row items-center justify-center mb-3"
        >
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={25}
            color={isFavorited ? "red" : "gray"}
          />
          <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
            {isFavorited ? "Added to Favorites" : "Add to Favorites"}
          </Text>
        </TouchableOpacity>
      </CardFooter>

      {/* Fullscreen Image */}
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

      {/* ✅ Custom AlertDialog */}
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

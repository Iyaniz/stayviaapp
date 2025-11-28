import React, { useEffect, useState } from "react";
import { Image, ActivityIndicator, View, StyleProp, ImageStyle } from "react-native";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

interface DownloadImageProps {
  path?: string | null; // Supabase storage path
  supabase: SupabaseClient<Database>;
  fallbackUri?: string; // Default image
  className?: string;
  style?: StyleProp<ImageStyle>;
}

export default function DownloadMsgImages({
  path,
  supabase,
  fallbackUri,
  className,
  style,
}: DownloadImageProps) {
  const [uri, setUri] = useState<string | undefined>(fallbackUri);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) return;

    const fetchImage = async () => {
      setLoading(true);
      try {
        // Check if file exists by listing objects in the bucket
        const { data: listData, error: listError } = await supabase
          .storage
          .from("messages-img") // must match upload bucket
          .list("", { limit: 1000 });

        if (listError) throw listError;

        const fileExists = listData?.some((file) => file.name === path);

        if (!fileExists) {
          setUri(fallbackUri);
          return;
        }

        // Generate a signed URL if the file exists
        const { data, error } = await supabase
          .storage
          .from("messages-img")
          .createSignedUrl(path, 60); // URL valid for 60 seconds

        if (error) throw error;
        setUri(data?.signedUrl ?? fallbackUri);
      } catch (err) {
        console.error("Download image error:", err);
        setUri(fallbackUri);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [path, supabase]);

  if (loading) {
    return (
      <View
        className={className}
        style={[{ justifyContent: "center", alignItems: "center" }, style]}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <Image source={{ uri }} className={className} style={style} />;
}

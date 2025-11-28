import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';
import DownloadImage from '@/components/download/downloadImage';
import { useSupabase } from '@/lib/supabase';

interface Rating {
  id: string;
  score: number;
  comment: string | null;
  created_at: string;
  rater?: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    avatar: string | null;
    account_type: string | null;
  };
}

interface RatingsDisplayProps {
  ratings: Rating[];
  isLoading?: boolean;
  onEditRating?: (ratingId: string) => void;
}

export const RatingsDisplay: React.FC<RatingsDisplayProps> = ({
  ratings,
  isLoading = false,
  onEditRating,
}) => {
  const { colors } = useAppTheme();
  const supabase = useSupabase();
  const defaultAvatar = 'https://i.pravatar.cc/150';

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [ratings]);

  const renderStars = (score: number) => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= score ? 'star' : 'star-outline'}
            size={16}
            color={star <= score ? '#FFB800' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getRaterName = (rater: Rating['rater']) => {
    if (!rater) return 'Anonymous User';
    const firstName = rater.firstname || '';
    const lastName = rater.lastname || '';
    return `${firstName} ${lastName}`.trim() || 'Anonymous User';
  };

  if (isLoading) {
    return (
      <View className="py-4">
        <Text style={{ color: colors.foreground }} className="text-lg font-bold">
          Reviews & Ratings
        </Text>
        <Text className="mt-2 text-center text-gray-500">Loading ratings...</Text>
      </View>
    );
  }

  if (ratings.length === 0) {
    return (
      <View className="py-6">
        <Text style={{ color: colors.foreground }} className="text-lg font-bold">
          Reviews & Ratings
        </Text>
        <Text className="mt-4 text-center text-gray-500">
          No ratings yet. Be the first to rate!
        </Text>
      </View>
    );
  }

  return (
    <View className="py-4">
      {/* Header with Average Rating */}
      <View className="mb-6">
        <Text style={{ color: colors.foreground }} className="text-lg font-bold">
          Reviews & Ratings
        </Text>

        {/* Average Rating Card */}
        <View
          className="mt-4 rounded-lg border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}>
          <View className="flex-row items-center justify-between">
            <View>
              <View className="mb-2 flex-row items-center gap-2">
                <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
                  {averageRating}
                </Text>
                <View>
                  {renderStars(Math.round(averageRating))}
                  <Text className="mt-1 text-sm text-gray-500">({ratings.length} reviews)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Rating Distribution */}
          <View className="mt-4 gap-2">
            {[5, 4, 3, 2, 1].map((score) => {
              const count = ratings.filter((r) => r.score === score).length;
              const percentage = (count / ratings.length) * 100;
              return (
                <View key={score} className="flex-row items-center gap-2">
                  <Text className="w-8 text-sm font-semibold" style={{ color: colors.foreground }}>
                    {score}★
                  </Text>
                  <View className="h-1.5 flex-1 rounded-full bg-gray-200">
                    <View
                      className="h-1.5 rounded-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="w-8 text-right text-xs text-gray-500">{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Individual Ratings */}
      <View>
        <Text style={{ color: colors.foreground }} className="mb-3 font-semibold">
          Recent Reviews
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="gap-3">
          {ratings.map((rating) => (
            <TouchableOpacity
              key={rating.id}
              onPress={() => onEditRating?.(rating.id)}
              activeOpacity={onEditRating ? 0.7 : 1}
              className="rounded-lg border p-4"
              style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              {/* Rater Info */}
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-3">
                  {rating.rater?.avatar ? (
                    <DownloadImage
                      path={rating.rater.avatar}
                      supabase={supabase}
                      fallbackUri={defaultAvatar}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  ) : (
                    <View className="h-10 w-10 rounded-full bg-gray-300" />
                  )}

                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      {getRaterName(rating.rater)}
                    </Text>
                    <Text className="text-xs text-gray-500">{formatDate(rating.created_at)}</Text>
                  </View>
                </View>

                {onEditRating && (
                  <TouchableOpacity onPress={() => onEditRating(rating.id)} className="p-2">
                    <Ionicons name="pencil" size={18} color={colors.foreground} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Stars */}
              <View className="mb-2">{renderStars(rating.score)}</View>

              {/* Comment */}
              {rating.comment && (
                <Text className="text-sm leading-5" style={{ color: colors.foreground }}>
                  {rating.comment}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

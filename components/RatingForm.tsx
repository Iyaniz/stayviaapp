import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';

interface RatingFormProps {
  propertyTitle: string;
  hostName: string;
  rentalDates: {
    startDate: string;
    endDate: string;
  };
  initialRating?: {
    score: number;
    comment: string;
  };
  isEditing?: boolean;
  onSubmit: (score: number, comment: string) => Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  propertyTitle,
  hostName,
  rentalDates,
  initialRating,
  isEditing = false,
  onSubmit,
  onSkip,
  isLoading = false,
}) => {
  const { colors } = useAppTheme();
  const [score, setScore] = useState(initialRating?.score || 0);
  const [comment, setComment] = useState(initialRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) {
      alert('Please select a rating');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(score, comment);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
          {isEditing ? 'Edit Your Rating' : 'How was your stay?'}
        </Text>
      </View>

      {/* Property Info */}
      <View
        className="mb-6 rounded-lg border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}>
        <Text className="mb-1 text-sm font-semibold text-gray-500">Property</Text>
        <Text className="mb-4 text-lg font-bold" style={{ color: colors.foreground }}>
          {propertyTitle}
        </Text>

        <Text className="mb-1 text-sm font-semibold text-gray-500">Host</Text>
        <Text className="mb-4" style={{ color: colors.foreground }}>
          {hostName}
        </Text>

        <Text className="mb-1 text-sm font-semibold text-gray-500">Your Stay</Text>
        <Text style={{ color: colors.foreground }}>
          {formatDate(rentalDates.startDate)} - {formatDate(rentalDates.endDate)}
        </Text>
      </View>

      {/* Star Rating */}
      <View className="mb-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.foreground }}>
          Rate your experience
        </Text>
      </View>

      {/* Property Info */}
      <View
        className="mb-6 rounded-lg border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}>
        <Text className="mb-1 text-sm font-semibold text-gray-500">Property</Text>
        <Text className="mb-4 text-lg font-bold" style={{ color: colors.foreground }}>
          {propertyTitle}
        </Text>

        <Text className="mb-1 text-sm font-semibold text-gray-500">Host</Text>
        <Text className="mb-4" style={{ color: colors.foreground }}>
          {hostName}
        </Text>

        <Text className="mb-1 text-sm font-semibold text-gray-500">Your Stay</Text>
        <Text style={{ color: colors.foreground }}>
          {formatDate(rentalDates.startDate)} - {formatDate(rentalDates.endDate)}
        </Text>
      </View>

      {/* Star Rating */}
      <View className="mb-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: colors.foreground }}>
          Rate your experience
        </Text>
        <View className="flex-row justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setScore(star)} className="p-2">
              <Ionicons
                name={star <= score ? 'star' : 'star-outline'}
                size={48}
                color={star <= score ? '#FFB800' : '#E0E0E0'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {score > 0 && (
          <Text className="mt-3 text-center text-sm text-gray-500">
            {score === 1 && 'Poor - Would not recommend'}
            {score === 2 && 'Fair - Room for improvement'}
            {score === 3 && 'Good - Would stay again'}
            {score === 4 && 'Very Good - Highly recommended'}
            {score === 5 && 'Excellent - Amazing experience!'}
          </Text>
        )}
      </View>

      {/* Comment */}
      <View className="mb-6">
        <Text className="mb-2 text-base font-semibold" style={{ color: colors.foreground }}>
          Share your experience (optional)
        </Text>
        <TextInput
          multiline
          numberOfLines={4}
          placeholder="Tell others about your stay... (e.g., cleanliness, host communication, amenities)"
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
          style={{
            backgroundColor: colors.card,
            color: colors.foreground,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            fontFamily: 'System',
            fontSize: 14,
          }}
          className="rounded-lg border"
        />
        <Text className="mt-2 text-xs text-gray-500">{comment.length}/500</Text>
      </View>

      {/* Actions */}
      <View className="gap-3">
        <TouchableOpacity
          disabled={isSubmitting || isLoading}
          onPress={handleSubmit}
          className={`rounded-lg py-4 ${isSubmitting || isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}>
          {isSubmitting || isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-semibold text-white">
              {isEditing ? 'Update Rating' : 'Submit Rating'}
            </Text>
          )}
        </TouchableOpacity>

        {!isEditing && onSkip && (
          <TouchableOpacity
            disabled={isSubmitting || isLoading}
            onPress={onSkip}
            className="rounded-lg border border-gray-300 py-4">
            <Text className="text-center font-semibold" style={{ color: colors.foreground }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme';

interface PaymentDate {
  date: Date;
  amount: number;
  rentalId: string;
  propertyTitle: string;
}

interface PaymentCalendarProps {
  paymentDates: PaymentDate[];
  onAddToCalendar?: (date: Date, description: string) => void;
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  paymentDates,
  onAddToCalendar,
}) => {
  const { colors } = useAppTheme();

  // Get the earliest payment date to determine which month to display
  const displayMonth = useMemo(() => {
    if (paymentDates.length === 0) return new Date();
    return new Date(Math.min(...paymentDates.map((p) => p.date.getTime())));
  }, [paymentDates]);

  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [displayMonth]);

  // Check if a date has a payment due
  const hasPaymentDue = (date: Date | null) => {
    if (!date) return false;
    return paymentDates.some(
      (p) =>
        p.date.getDate() === date.getDate() &&
        p.date.getMonth() === date.getMonth() &&
        p.date.getFullYear() === date.getFullYear()
    );
  };

  // Get payment for a specific date
  const getPaymentForDate = (date: Date | null): PaymentDate | undefined => {
    if (!date) return undefined;
    return paymentDates.find(
      (p) =>
        p.date.getDate() === date.getDate() &&
        p.date.getMonth() === date.getMonth() &&
        p.date.getFullYear() === date.getFullYear()
    );
  };

  const monthName = displayMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Get next payment
  const nextPayment = useMemo(() => {
    const now = new Date();
    return paymentDates.find((p) => p.date >= now);
  }, [paymentDates]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
          📅 Payment Schedule
        </Text>
      </View>

      {/* Next Payment Alert */}
      {nextPayment && (
        <View
          className="mb-6 rounded-lg border-l-4 bg-blue-50 p-4"
          style={{ borderLeftColor: '#2563EB' }}>
          <Text className="text-sm font-semibold text-blue-600">Next Payment Due</Text>
          <Text className="mt-1 text-xl font-bold text-blue-900">
            {nextPayment.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text className="mt-1 text-lg font-semibold text-blue-900">
            Amount: ₱{nextPayment.amount.toLocaleString()}
          </Text>
          <Text className="mt-1 text-sm text-blue-700">{nextPayment.propertyTitle}</Text>
        </View>
      )}

      {/* Calendar */}
      <View
        className="mb-6 rounded-lg border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}>
        {/* Month Header */}
        <Text className="mb-4 text-center text-lg font-bold" style={{ color: colors.foreground }}>
          {monthName}
        </Text>

        {/* Day labels */}
        <View className="mb-2 flex-row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text
              key={day}
              className="flex-1 text-center text-xs font-semibold"
              style={{ color: colors.foreground }}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View>
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
            <View key={weekIndex} className="mb-1 flex-row gap-1">
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const hasPayment = hasPaymentDue(day);
                const payment = getPaymentForDate(day);

                return (
                  <View
                    key={dayIndex}
                    className="aspect-square flex-1 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: hasPayment ? '#DC2626' : colors.card,
                      borderColor: hasPayment ? '#DC2626' : colors.border,
                    }}>
                    {day ? (
                      <>
                        <Text
                          className="font-semibold"
                          style={{
                            color: hasPayment ? '#fff' : colors.foreground,
                          }}>
                          {day.getDate()}
                        </Text>
                        {hasPayment && <Text className="text-xs text-red-100">💳</Text>}
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View className="mt-4 flex-row items-center gap-2">
          <View className="h-4 w-4 rounded-sm bg-red-600" />
          <Text className="text-sm" style={{ color: colors.foreground }}>
            Payment due date
          </Text>
        </View>
      </View>

      {/* All Payment Dates List */}
      <View className="mb-6">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.foreground }}>
          All Payment Dates
        </Text>

        {paymentDates.length === 0 ? (
          <Text className="text-center text-gray-500">No upcoming payments</Text>
        ) : (
          <View className="gap-2">
            {paymentDates.map((payment, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (onAddToCalendar) {
                    onAddToCalendar(
                      payment.date,
                      `Payment due: ${payment.propertyTitle} - ₱${payment.amount}`
                    );
                  }
                }}
                className="flex-row items-center justify-between rounded-lg border p-3"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.foreground }}>
                    {payment.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text className="text-sm text-gray-500">{payment.propertyTitle}</Text>
                </View>
                <Text className="font-bold" style={{ color: colors.foreground }}>
                  ₱{payment.amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Add to Calendar Button */}
      {nextPayment && onAddToCalendar && (
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => {
              onAddToCalendar(
                nextPayment.date,
                `Payment due: ${nextPayment.propertyTitle} - ₱${nextPayment.amount}`
              );
            }}
            className="flex-row items-center justify-center rounded-lg bg-blue-600 py-3">
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text className="ml-2 font-semibold text-white">Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

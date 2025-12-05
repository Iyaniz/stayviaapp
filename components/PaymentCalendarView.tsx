import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { format, getDaysInMonth, startOfMonth, endOfMonth, isSameDay } from 'date-fns';

interface Payment {
  id: string;
  due_date: string;
  amount: number;
  status: string;
  tenant?: { firstname: string; lastname: string };
  post?: { title: string };
}

interface PaymentCalendarViewProps {
  payments: Payment[];
  currentDate: Date;
  onDateSelected?: (date: Date) => void;
  onPaymentSelected?: (payment: Payment) => void;
  colors: any;
}

export const PaymentCalendarView: React.FC<PaymentCalendarViewProps> = ({
  payments,
  currentDate,
  onDateSelected,
  onPaymentSelected,
  colors,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = new Date(monthStart);
  startDate.setDate(1);
  const firstDayOfWeek = startDate.getDay();

  // Group payments by date
  const paymentsByDate = useMemo(() => {
    const grouped: Record<string, Payment[]> = {};
    payments.forEach((payment) => {
      const dateKey = payment.due_date.split('T')[0]; // Extract YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(payment);
    });
    return grouped;
  }, [payments]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(firstDayOfWeek).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'unpaid':
        return '#EF4444';
      case 'overdue':
        return '#F59E0B';
      case 'partial':
        return '#8B5CF6';
      case 'cancelled':
        return '#9CA3AF';
      default:
        return '#6B7280';
    }
  };

  const getDayPayments = (day: number) => {
    // Format date as YYYY-MM-DD using local time components (no timezone shift)
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return paymentsByDate[dateStr] || [];
  };

  const getDayStatusSummary = (day: number) => {
    const dayPayments = getDayPayments(day);
    if (dayPayments.length === 0) return null;

    // Return most critical status
    const hasUnpaid = dayPayments.some((p) => p.status === 'unpaid');
    const hasOverdue = dayPayments.some((p) => p.status === 'overdue');
    const hasPaid = dayPayments.some((p) => p.status === 'paid');

    if (hasOverdue) return 'overdue';
    if (hasUnpaid) return 'unpaid';
    if (hasPaid) return 'paid';
    return null;
  };

  return (
    <View>
      {/* Calendar Header */}
      <View
        className="mb-4 rounded-lg border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}>
        {/* Week Days */}
        <View className="mb-2 flex-row justify-between">
          {weekDays.map((day) => (
            <View key={day} className="flex-1 items-center py-2">
              <Text className="text-xs font-semibold text-gray-500">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row justify-between">
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <View key={`empty-${dayIndex}`} className="flex-1 items-center py-2" />;
                }

                const dayPayments = getDayPayments(day);
                const statusSummary = getDayStatusSummary(day);
                const isToday = isSameDay(
                  new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                  new Date()
                );

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      const selectedDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      );
                      onDateSelected?.(selectedDate);
                      if (dayPayments.length === 1) {
                        onPaymentSelected?.(dayPayments[0]);
                      }
                    }}
                    className="flex-1 items-center py-2">
                    <View
                      className={`h-12 w-12 items-center justify-center rounded-lg ${
                        isToday ? 'border-2' : ''
                      }`}
                      style={{
                        backgroundColor: statusSummary
                          ? getPaymentStatusColor(statusSummary)
                          : colors.background,
                        borderColor: isToday ? colors.foreground : 'transparent',
                        opacity: dayPayments.length > 0 ? 1 : 0.5,
                      }}>
                      <Text
                        className="text-center font-semibold"
                        style={{
                          color: statusSummary ? '#fff' : colors.foreground,
                        }}>
                        {day}
                      </Text>
                      {dayPayments.length > 1 && (
                        <Text
                          className="text-xs"
                          style={{
                            color: statusSummary ? '#fff' : colors.foreground,
                          }}>
                          +{dayPayments.length}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View
        className="mb-4 rounded-lg border p-3"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}>
        <Text className="mb-3 text-xs font-semibold text-gray-500">LEGEND</Text>
        <View className="gap-2">
          <View className="flex-row items-center gap-3">
            <View className="h-4 w-4 rounded" style={{ backgroundColor: '#10B981' }} />
            <Text className="text-sm" style={{ color: colors.foreground }}>
              Paid
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-4 w-4 rounded" style={{ backgroundColor: '#EF4444' }} />
            <Text className="text-sm" style={{ color: colors.foreground }}>
              Unpaid
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-4 w-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
            <Text className="text-sm" style={{ color: colors.foreground }}>
              Overdue
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-4 w-4 rounded" style={{ backgroundColor: '#8B5CF6' }} />
            <Text className="text-sm" style={{ color: colors.foreground }}>
              Partial
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

import { Stack } from "expo-router";

export default function NotificationStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Notifications list */}
      <Stack.Screen
        name="index"
        options={{
          title: "Notifications",
        }}
      />
    </Stack>
  );
}

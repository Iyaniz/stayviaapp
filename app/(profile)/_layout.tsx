import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import FeatherIcon from "@expo/vector-icons/Feather";
import { router } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="editProfile"
        options={{
          title: "Update Profile",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Account Settings",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "StayVia",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "Help & FAQs",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact Support",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="terms"
        options={{
          title: "Terms & Conditions",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: "Privacy Policy",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

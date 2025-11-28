import { Tabs } from "expo-router";

export default function TabsLayout(){
    return (
      <Tabs screenOptions={{headerShown: false}}>
        <Tabs.Screen
        name="[id]"
        options={{
          title: "User Profile",
          tabBarStyle: {display: "none"}
        }}
      />
        
    </Tabs>
    )
}
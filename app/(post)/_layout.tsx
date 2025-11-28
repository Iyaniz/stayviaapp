import { Tabs } from "expo-router";

export default function TabsLayout(){
    return (
      <Tabs screenOptions={{headerShown: false}}>
        <Tabs.Screen
        name="[id]"
        options={{
          title: "Post Details",
          tabBarStyle: {display: "none"}
        }}
      />
        <Tabs.Screen
        name="index"
        options={{
          title: "Create Post",
          tabBarStyle: {display: "none"}
        }}
      />
       
        
    </Tabs>
    )
}
import { Tabs } from "expo-router";

export default function TabsLayout(){
    return (
      <Tabs screenOptions={{headerShown: false}}>
        <Tabs.Screen
        name="index"
        options={{
          title: "Creating Landlord Account",
          tabBarStyle: {display: "none"}
        }}
      />
        
    </Tabs>
    )
}
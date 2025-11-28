import { Stack } from "expo-router";

export default function StackLayout(){
    return (
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen
        name="index"
        options={{
          title: "HomeScreen",
        }}
      />
        
    </Stack>
    )
}
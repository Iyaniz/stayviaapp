import { Link, Tabs } from "expo-router";
import React from "react";
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout(){
    return (
      <Tabs screenOptions={{headerShown: true}}>
        <Tabs.Screen
        name="[id]"
        options={{
          title: "New Chat",
          tabBarStyle: {display: "none"},
          headerLeft: () => (
            <Link href='/chat' asChild>
              <Ionicons name='chevron-back' size={28} className='px-1' color='gray' />
            </Link>
          ),
        }}
      />
       
        
    </Tabs>
    )
}

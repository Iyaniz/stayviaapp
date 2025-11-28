import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={({ navigation }) => ({
          title: 'StayVia Chats',
          headerRight: () => (
            <Link href='/(chat)/chat' asChild>
              <Ionicons name='add' size={28} className='px-1' color='gray' />
            </Link>
          ),
        })}
      />
    </Stack>
  );
}


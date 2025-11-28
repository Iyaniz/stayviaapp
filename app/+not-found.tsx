import { Link, Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import ScreenWrapper from '@/components/ScreenWrapper';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found!' }} />
        <ScreenWrapper>
          <ScrollView className="flex-1 bg-white">
            <View className='w-full h-full items-center justify-center p-5'>
              <Text>This screen doesn't exist.</Text>

              {/* <Link href="/(auth)/sign-in" asChild>
                <Text className='text-blue-500 py-5'>Go to home screen!</Text>
              </Link> */}
            </View>
          </ScrollView>
           
        </ScreenWrapper>
    </>
  );
}

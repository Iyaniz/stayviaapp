import * as React from 'react';
import { Image, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useSSO, type StartSSOFlowParams } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';

WebBrowser.maybeCompleteAuthSession();

type SocialConnectionStrategy = Extract<
  StartSSOFlowParams['strategy'],
  'oauth_google'
>;

const GOOGLE_STRATEGY = {
  type: 'oauth_google' as SocialConnectionStrategy,
  source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
};

export function SocialConnections() {
  useWarmUpBrowser();
  const { colorScheme } = useColorScheme();
  const { startSSOFlow } = useSSO();

  const onGoogleLoginPress = async () => {
    try {
      // Use Linking.createURL for better release build compatibility
      const redirectUri = Linking.createURL('oauth-callback');
      
      // Debug: Show redirect URL
      console.log('Redirect URI:', redirectUri);

      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: redirectUri,
      });

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: 'You have successfully signed in.',
        });
      } else if (signIn?.status === 'complete') {
        await setActive?.({ session: signIn.createdSessionId });
        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: 'You have successfully signed in.',
        });
      } else if (signUp?.status === 'complete') {
        await setActive?.({ session: signUp.createdSessionId });
        Toast.show({
          type: 'success',
          text1: 'Account created!',
          text2: 'Welcome to StayVia.',
        });
      } else if (signIn?.status === 'needs_identifier' || signUp?.status === 'missing_requirements') {
        // OAuth returned but Clerk needs more info - show detailed debug info
        const missingFields = signUp?.missingFields?.join(', ') || 'none';
        const signInId = signIn?.identifier || 'none';
        Toast.show({
          type: 'info',
          text1: `SignIn: ${signIn?.status || 'none'}`,
          text2: `Missing: ${missingFields}, ID: ${signInId}`,
          visibilityTime: 6000,
        });
      } else if (signIn?.status === 'needs_first_factor') {
        Toast.show({
          type: 'info',
          text1: 'Verification needed',
          text2: 'Please complete verification to continue.',
          visibilityTime: 4000,
        });
      } else {
        // Debug: show all available info
        const signInStatus = signIn?.status || 'none';
        const signUpStatus = signUp?.status || 'none';
        Toast.show({
          type: 'error',
          text1: 'Login incomplete',
          text2: `SignIn: ${signInStatus}, SignUp: ${signUpStatus}`,
          visibilityTime: 5000,
        });
      }
    } catch (err: any) {
      console.error('Google SSO error:', err);
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: err?.message || 'Please try again.',
        visibilityTime: 4000,
      });
    }
  };

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      <Button
        variant="outline"
        size="lg"
        className="sm:flex-1 flex-row items-center justify-center"
        onPress={onGoogleLoginPress}
      >
        <Image
          source={GOOGLE_STRATEGY.source}
          className={cn('size-4 mr-2')}
        />
        <Text>Sign in with Google</Text>
      </Button>
    </View>
  );
}

const useWarmUpBrowser = Platform.select({
  web: () => {},
  default: () => {
    React.useEffect(() => {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }, []);
  },
});

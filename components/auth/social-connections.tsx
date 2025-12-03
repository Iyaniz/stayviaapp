import * as React from 'react';
import { Image, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useSSO, type StartSSOFlowParams } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
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
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'stayvia' });

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
      } else {
        const status = signIn?.status || signUp?.status || 'unknown';
        Toast.show({
          type: 'error',
          text1: 'Login incomplete',
          text2: `Status: ${status}. Please try again.`,
        });
      }
    } catch (err: any) {
      console.error('Google SSO error:', err);
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: err?.message || 'Please try again.',
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

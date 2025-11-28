import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import * as React from 'react';
import { type TextInput, View, Image, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native'; 
import { ActivityIndicator } from "react-native"; 

// zod
import {z} from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


const signInSchema = z.object({
  identifier: z.string().min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type SignInFields = z.infer<typeof signInSchema>;

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false); 
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});


  async function onSubmit() {
    if (!isLoaded || loading) return;
    setLoading(true); 

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        setError({ email: '', password: '' });
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }

      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
      } else {
        console.error(JSON.stringify(err, null, 2));
      }
    } finally {
      setLoading(false); 
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none">
        <CardHeader className='mb-4'>
          <CardTitle className="text-center pb-0 mb-[-10px]">
            <Image
              source={require("@/assets/images/icon.png")} 
              style={{ width: 200, height: 115, resizeMode: "cover" }}
            />
          </CardTitle>
          <CardDescription className="text-center sm:text-left pt-0 mt-[-10px]">
            Your home away from home made easy
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            {/* Email */}
        <View className="gap-1.5">
          <Label htmlFor="email">Email/Username</Label>
          <View className="flex-row items-center border-b border-gray-300 dark:border-gray-600">
            <Input
              id="email"
              placeholder="m@gmail.com"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              onChangeText={setEmail}
              onSubmitEditing={onEmailSubmitEditing}
              returnKeyType="next"
              submitBehavior="submit"
              className="flex-1 border-0 rounded-none bg-transparent focus:ring-0 focus:border-primary"
            />
          </View>
          {error.email ? (
            <Text className="text-sm font-medium text-destructive">{error.email}</Text>
          ) : null}
        </View>

        {/* Password with toggle */}
        <View className="gap-1.5">
          <Label htmlFor="password">Password</Label>
          <View className="flex-row items-center border-b border-gray-300 dark:border-gray-600">
            <Input
              ref={passwordInputRef}
              id="password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              className="flex-1 border-0 rounded-none bg-transparent focus:ring-0 focus:border-primary"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="px-3 py-2"
            >
              {showPassword ? (
                <EyeOff size={20} color="#6b7280" />
              ) : (
                <Eye size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
          {error.password ? (
            <Text className="text-sm font-medium text-destructive">{error.password}</Text>
          ) : null}
        </View>


            {/* Forgot Password */}
            <Link asChild href={`/(auth)/forgot-password?email=${email}`}>
              <Button
                variant="link"
                size="sm"
                className="ml-auto px-1 py-0 h-fit"
              >
                <Text className="font-normal leading-4">Forgot your password?</Text>
              </Button>
            </Link>

            <Button className="w-full" onPress={onSubmit} disabled={loading}>
              {loading ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="font-bold">Logging in...</Text>
                </View>
              ) : (
                <Text className="font-bold">Login</Text>
              )}
            </Button>

          </View>

          {/* Sign up link */}
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/(auth)/sign-up" className="text-sm underline underline-offset-4">
              Sign up
            </Link>
          </Text>

          {/* Divider */}
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">or</Text>
            <Separator className="flex-1" />
          </View>

          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}


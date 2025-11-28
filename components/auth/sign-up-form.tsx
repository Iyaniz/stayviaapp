import { SocialConnections } from '@/components/auth/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);

  const [error, setError] = React.useState<{ email?: string; password?: string; confirmPassword?: string; username?: string }>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false); 

  async function onSubmit() {
  if (!isLoaded) return;

  // simple validation
  if (!username.trim()) {
    setError({ username: 'Username is required' });
    return;
  }
  if (password !== confirmPassword) {
    setError({ confirmPassword: 'Passwords do not match' });
    return;
  }

  try {
    setLoading(true); // start loading

    await signUp.create({
      emailAddress: email,
      password,
      username, // clerk supports username field if enabled
    });

    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

    router.push(`/(auth)/sign-up/verify-email?email=${email}`);
  } catch (err) {
    if (err instanceof Error) {
      const isEmailMessage =
        err.message.toLowerCase().includes('identifier') ||
        err.message.toLowerCase().includes('email');
      setError(isEmailMessage ? { email: err.message } : { password: err.message });
      return;
    }
    console.error(JSON.stringify(err, null, 2));
  } finally {
    setLoading(false); // stop loading (success or error)
  }
}


  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onPasswordSubmitEditing() {
    confirmPasswordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-3xl sm:text-left font-extrabold text-primary">
            Registration
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            Join StayVia community!
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-5">
            {/* Username */}
            <View className="gap-1.5">
              <Label htmlFor="username">Username</Label>
              <View className="flex-row items-center border-b border-gray-300 dark:border-gray-600">
                <Input
                  id="username"
                  placeholder="Enter username"
                  autoCapitalize="none"
                  onChangeText={setUsername}
                  returnKeyType="next"
                  onSubmitEditing={onEmailSubmitEditing}
                  className="flex-1 border-0 rounded-none bg-transparent focus:ring-0 focus:border-primary"
                />
                {error.username ? (
                  <Text className="text-sm font-medium text-destructive">{error.username}</Text>
                ) : null}
              </View>
            </View>

            {/* Email */}
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <View className="flex-row items-center border-b border-gray-300 dark:border-gray-600">

                <Input
                  id="email"
                  placeholder="m@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  returnKeyType="next"
                  onSubmitEditing={onEmailSubmitEditing}
                  className="flex-1 border-0 rounded-none bg-transparent focus:ring-0 focus:border-primary"
                />
                {error.email ? (
                  <Text className="text-sm font-medium text-destructive">{error.email}</Text>
                ) : null}
              </View>
            </View>

            {/* Password */}
            <View className="gap-1.5">
              <Label htmlFor="password">Password</Label>
              <View className="flex-row items-center border-b border-gray-300 dark:border-gray-600">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  returnKeyType="next"
                  onSubmitEditing={onPasswordSubmitEditing}
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

            {/* Confirm Password */}
            <View className="gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <View className="flex-row items-center border-b border-gray-300 dark:border-gray-600">
                <Input
                  ref={confirmPasswordInputRef}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                  className="flex-1 border-0 rounded-none bg-transparent focus:ring-0 focus:border-primary"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-3 py-2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {error.confirmPassword ? (
                <Text className="text-sm font-medium text-destructive">{error.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Submit button */}
            <Button className="w-full" onPress={onSubmit} disabled={loading}>
              {loading ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="font-bold">Creating...</Text>
                </View>
              ) : (
                <Text className="font-bold">Create Account</Text>
              )}
            </Button>


          </View>

          <Text className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/(auth)/sign-in" dismissTo className="text-sm underline underline-offset-4">
              Sign in
            </Link>
          </Text>

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

import React from 'react';
import { SafeAreaView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenWrapperProps = {
  children: React.ReactNode;
  withPadding?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenWrapper({
  children,
  withPadding = true,
  style,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        withPadding && {
          paddingTop: insets.top || 22,
          paddingBottom: insets.bottom || 16,
          paddingHorizontal: 8,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

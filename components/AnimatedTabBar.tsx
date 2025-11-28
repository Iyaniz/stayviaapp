// components/AnimatedTabBar.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'notification' | 'home' | 'account';

const TABS: Record<TabKey, { icon: string }> = {
  notification: { icon: 'chatbubble-ellipses-outline' },
  home: { icon: 'home-outline' },
  account: { icon: 'person-outline' },
};

export default function AnimatedTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const animatedCircle = useAnimatedStyle(() => ({
          transform: [
            { scale: withTiming(isFocused ? 1.2 : 0.5, { duration: 200 }) },
          ],
          opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
        }));

        const tabKey = route.name as TabKey;
        const tabInfo = TABS[tabKey];

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tab}
          >
            <View style={styles.iconContainer}>
              {isFocused && (
                <Animated.View style={[styles.circle, animatedCircle]} />
              )}
              <Ionicons
                name={tabInfo?.icon as any}
                size={24}
                color={isFocused ? '#fff' : '#888'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 70,
    // borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 8,
    marginBottom: 22,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: '#4353Fd',
    zIndex: -1,
  },
});


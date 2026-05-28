import React, { useState, useEffect, useRef } from 'react';
import { Stack, usePathname } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="wellness" />
          <Stack.Screen name="success" />
          <Stack.Screen name="admin" />
        </Stack>

        {isNavigating && (
          <View className="absolute inset-0 z-50 items-center justify-center bg-white/95">
            <LinearGradient
              colors={['#ede9fe', '#fdf2f8', '#e0f2fe']}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View className="items-center justify-center px-6">
              <LottieView
                source={require('../../assets/lottie/Sandy Loading.json')}
                autoPlay
                loop
                style={{ width: 220, height: 220 }}
              />
              <MotiView
                from={{ opacity: 0.5, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1.02 }}
                transition={{ loop: true, type: 'timing', duration: 1500, direction: 'alternate' as any }}
                style={{ marginTop: 12 }}
              >
                <Text className="text-lg font-black text-center text-purple-600">
                  Loading portal... ✨
                </Text>
              </MotiView>
            </View>
          </View>
        )}
      </View>
    </ThemeProvider>
  );
}

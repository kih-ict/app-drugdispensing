import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, BackHandler, Alert } from 'react-native';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments(); // Current route path segments

  useEffect(() => {
    const handleBackPress = () => {
      // Check if user is on the home screen
      if (segments.length === 1 && segments[0] === '(tabs)') {
         BackHandler.exitApp();
        return true; // Prevent default back navigation
      }
      return false; // Allow default back navigation
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [segments]); // Re-run effect if route changes

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stocktake"
        options={{
          title: 'Stocktake',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="assessment.fill" color={color} />,
          unmountOnBlur: true, // Tambahkan ini untuk memuat ulang tab setiap kali diakses
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="logout.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

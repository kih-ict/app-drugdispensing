import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, BackHandler } from 'react-native';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      setIsReady(true);
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (isLoggedIn) {
        router.replace('(tabs)');
      } else {
        router.replace('/login/login');
      }
    }
  }, [isReady, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      const backAction = () => true;
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }
  }, [isLoggedIn]);

  if (!isReady) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return null; // Tidak render UI karena langsung routing
}

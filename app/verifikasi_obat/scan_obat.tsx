import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Easing,
  useAnimatedValue,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';

export default function ScanObat() {
  const [scanned, setScanned] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [id, setId] = useState('');
  const [sbu, setSbu] = useState('');
    const [flash, setFlash] = useState(false);
  const router = useRouter();
  const { code, prn } = useLocalSearchParams(); // Medical number passed from UserList

  // Animasi untuk efek scanning
    const animatedValue = useAnimatedValue(0);
  const animationDuration = 700; // Durasi animasi;

 useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
 const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250], // Menggerakkan fokus box naik turun dengan range yang lebih besar
  });

  const toggleFlash = () => {
    setFlash(!flash);
  };
  useEffect(() => {
    // Request camera permission when the component mounts
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }

    const fetchUserData = async () => {
      const storedName = await AsyncStorage.getItem('userId');
      const storedSbu = await AsyncStorage.getItem('userSbu');
      if (storedName) setId(storedName);
      if (storedSbu) setSbu(storedSbu);
    };

    fetchUserData();
  }, [cameraPermission]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);


      try {
        const token = await AsyncStorage.getItem('userToken');

        if (token) {
          const response = await axios.post(
            'https://medication.kih.co.id/api/Proses/Item',
            { code: data, id, sbu },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Handle response
          Alert.alert('Success', response.data.message || 'Item processed successfully');
        } else {
          Alert.alert('Error', 'No token found');
        }
      } catch (error) {
        Alert.alert('Error', 'Item Not Found');
      }


        router.back();


  };

  if (!cameraPermission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!cameraPermission.granted) {
    return <Text>No access to camera. Please allow camera permissions.</Text>;
  }

  return (
    <View style={styles.container}>
     <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flash}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Dark Overlay */}
        <View style={styles.overlay}>
          <Svg height="100%" width="100%" style={styles.overlay}>
            <Defs>
              <Mask id="mask" x="0" y="0" width="100%" height="100%">
                <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                <Rect x="15%" y="35%" width="250" height="245" fill="black" />
              </Mask>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="black"
              mask="url(#mask)"
              opacity="0.8"
            />
          </Svg>

          {/* Fokus Box dengan Animasi */}
           <View style={styles.focusBox}>
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY }],
                },
              ]}
            />


          </View>
        </View>
      </CameraView>

      {/* Flashlight Toggle Button */}
      <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
        <MaterialIcons
          name={flash ? 'flash-on' : 'flash-off'}
          size={20}
          color={flash ? 'yellow' : 'white'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  focusBox: { position: 'absolute', width: 250, height: 250 },
  scanLine: {
    height: 2,
    width: 249,
    backgroundColor: '#00FF00',
    position: 'absolute',
  },
  scanText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  flashButton: { position: 'absolute', top: 50, left: '85%', padding: 10 },
  loadingText: { position: 'absolute', top: 120, alignSelf: 'center', fontSize: 16, color: '#fff' },
});

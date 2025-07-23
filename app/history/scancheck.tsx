import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Button,
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

export default function scancheck() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
    const [flash, setFlash] = useState(false);
  const { medicalNumber } = useLocalSearchParams(); // Medical number passed from UserList
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
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
  // Check camera permission
  if (!cameraPermission) {
    requestCameraPermission();
    return <Text>Requesting camera permission...</Text>;
  }
  if (!cameraPermission.granted) {
    return <Text>No access to camera. Please allow camera permissions.</Text>;
  }

  const fetchDrugs = async (prn) => {
    try {
      setLoading(true); // Set loading state to true
      const token = await AsyncStorage.getItem('userToken');
      const storedId = await AsyncStorage.getItem('userId');
      const storedSbu = await AsyncStorage.getItem('userSbu');

      if (!token || !storedId || !storedSbu) {
        throw new Error('Data login tidak lengkap.');
      }

      const response = await axios.post(
        'https://medication.kih.co.id/api/checksnapshoot',
        { id: storedId, sbu: storedSbu, itemcode: prn },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle API response
      if (response.data.success) {
        console.log(`/history/stockgudang?code=${prn}&ids=${response.data.item}`);
        Alert.alert(
          'Confirmation',
          response.data.message,
          [
            {
              text: 'Update',
              onPress: () => router.push(`/history/stockgudang?code=${prn}&ids=${response.data.item}`), // Arahkan ke halaman stockgudang
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      } else if (response.data.error) {
        console.log(`/history/stockgudang?code=${prn}&ids=${response.data.item}`);
        Alert.alert(
          'Notice',
          response.data.message,
          [
            {
              text: 'OK',
              onPress: () => router.push(`/history/updatestock?code=${prn}&ids=${response.data.item}`), // Arahkan ke halaman updatestock
            },
          ],
          { cancelable: true }
        );
      }
      else if(response.data.error_job)
      {
        Alert.alert('Error', response.data.message , [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }

    } catch (error) {
      Alert.alert('Error', error.message || 'PRN not found.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const toggleFlash = () => {
    setFlash(!flash);
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);

    if (data) {
      fetchDrugs(data); // Fetch drugs using scanned PRN
    } else {
      Alert.alert('Error', 'PRN does not match.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }
  };

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
      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
      {loading && <Text style={styles.loadingText}>Loading Verification data...</Text>}
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

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
  Dimensions ,
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

export default function Scanner_prn() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [flash, setFlash] = useState(false);
  const router = useRouter();
  const { medicalNumber } = useLocalSearchParams();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const boxWidth = screenWidth * 0.7; // Lebar kotak 70% dari lebar layar
  const boxHeight = screenHeight * 0.3; // Tinggi kotak 30% dari tinggi layar
  const boxX = (screenWidth - boxWidth) / 2; // Posisi X tengah
  const boxY = screenHeight * 0.35; // Posisi Y 35% dari atas layar


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

  // Permission setup
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    requestPermission();
    return <Text>Requesting camera permission...</Text>;
  }
  if (!permission.granted) {
    return <Text>No access to camera. Please allow camera permissions.</Text>;
  }


  // Handle scan barcode
 const handleBarCodeScanned = ({ data, bounds }) => {
  setScanned(true);

  if (bounds) {
    const { origin, size } = bounds;
    const barcodeX = origin.x;
    const barcodeY = origin.y;
    const barcodeWidth = size.width;
    const barcodeHeight = size.height;

    // Tampilkan posisi barcode dalam Alert

            // Periksa apakah barcode berada di dalam kotak
           if (
              barcodeY >= boxX && // Gunakan barcodeY untuk horizontal
              barcodeY + barcodeHeight <= boxX + boxWidth &&
              barcodeX >= boxY && // Gunakan barcodeX untuk vertikal
              barcodeX + barcodeWidth <= boxY + boxHeight
            ) {
              router.push(`verifikasi/loading?prn=${data}`);
            } else {
              setScanned(false);
      }

  } else {
    // Tidak ada bounds, coba pindai
    router.push(`verifikasi/loading?prn=${data}`);
  }
};



  // Toggle flash
  const toggleFlash = () => {
    setFlash(!flash);
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

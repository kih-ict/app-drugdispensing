import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Scan() {
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { medicalNumber } = useLocalSearchParams(); // Medical number passed from UserList
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Check camera permission
  if (!cameraPermission) {
    requestCameraPermission();
    return <Text>Requesting camera permission...</Text>;
  }
  if (!cameraPermission.granted) {
    return <Text>No access to camera. Please allow camera permissions.</Text>;
  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);

    if (data === medicalNumber) {
      Alert.alert('Success', 'PRN matched! Redirecting to listobat...');
      router.push(`verifikasi/listobat?prn=${data}`);
    } else {
      Alert.alert('Error', 'PRN does not match.');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing='back'
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Scan Barcode</Text>
        </View>
      </CameraView>
      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});

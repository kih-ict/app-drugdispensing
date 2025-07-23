import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import axios from 'axios'; // Import axios

const Scanner = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]); // Menyimpan riwayat hasil scan
  const [apiMessage, setApiMessage] = useState<string | null>(null); // Pesan API
  const [apiLoket, setApiLoket] = useState<string | null>(null); // Pesan API
  const [showPopup, setShowPopup] = useState(false); // Kontrol visibilitas pop-up
  const [id, setId] = useState('');
 const [sbu, setSbu] = useState('');
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const fetchUserName = async () => {
      const storedName = await AsyncStorage.getItem('userId');
      const storedSbu = await AsyncStorage.getItem('userSbu');
      if (storedName) {
        setId(storedName);
      }
      if (storedSbu) {
        setSbu(storedSbu);
      }
    };

    fetchUserName();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = (() => {
  let lastScanned = 0; // Waktu terakhir barcode diproses

  return async ({ type, data }: { type: string; data: string }) => {
    const now = Date.now();

    if (now - lastScanned < 2000) {
      // Abaikan jika barcode dipindai dalam waktu kurang dari 2 detik
      return;
    }

    lastScanned = now; // Perbarui waktu terakhir
    setScanned(true);
    setScanData(data);
    setScanHistory(prevHistory => [data, ...prevHistory]);
    console.log(id);

    const token = await AsyncStorage.getItem('userToken');

    if (token) {
      try {
        const response = await axios.post(
          'https://medication.kih.co.id/api/Proses/Item',
          { code: data, id: id, sbu: sbu },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setApiMessage(response.data.message);
        setApiLoket(response.data.loket);
      } catch (error) {
        setApiMessage('Item Not Found');
      }
    } else {
      setApiMessage('No token found');
    }

    // Tampilkan popup selama 3 detik
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };
})();

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.bottomContainer}>
        {scanned && (
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
        )}
        {scanData && (
          <View style={styles.scanDataContainer}>
            <Text style={styles.scanData}>Scanned Data: {scanData}</Text>
          </View>
        )}

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Scan History</Text>
          <ScrollView style={styles.historyList}>
            {scanHistory.map((data, index) => (
              <Text key={index} style={styles.historyItem}>
                {data}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Pop-up Message */}
     {showPopup && (
        <View style={styles.popupContainer}>
          <Text style={styles.popupText}>{apiMessage}</Text>
          <Text style={styles.popupLoketText}>{apiLoket}</Text> 
        </View>
      )}



    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupLoketText: {
  color: 'black', // Warna teks hitam
  fontSize: 24, // Ukuran font lebih besar
  fontWeight: 'bold', // Teks tebal
  textAlign: 'center', // Teks di tengah
  marginTop: 10, // Jarak dari teks sebelumnya
},

  camera: {
    width: '100%',
    height: '40%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  scanDataContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 10,
  },
  scanData: {
    color: 'white',
    fontSize: 16,
  },
  historyContainer: {
    marginTop: 20,
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    borderRadius: 10,
  },
  historyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyList: {
    maxHeight: 150,
  },
  historyItem: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  popupContainer: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  popupContainer: {
    position: 'absolute',
    top: '40%', // Posisikan pop-up di tengah layar
    left: '25%', // Sesuaikan untuk membuat pop-up tetap berada di tengah horizontal
    width: '50%', // Lebar pop-up sama dengan tingginya
    aspectRatio: 1, // Membuat pop-up menjadi kotak
    backgroundColor: 'white', // Warna putih untuk pop-up
    borderRadius: 10, // Sudut membulat
    justifyContent: 'center', // Konten berada di tengah
    alignItems: 'center', // Konten berada di tengah
    shadowColor: '#000', // Tambahkan bayangan agar terlihat lebih menarik
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Bayangan untuk perangkat Android
  },
  popupText: {
    color: 'black', // Warna teks hitam
    fontSize: 16, // Ukuran font
    fontWeight: 'bold',
    textAlign: 'center', // Teks di tengah
  },

});

export default Scanner;

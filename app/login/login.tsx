import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nfcPopupVisible, setNfcPopupVisible] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const [nfcTagId, setNfcTagId] = useState('');
  const [loadingNfc, setLoadingNfc] = useState(false);



  const router = useRouter();

  // Initialize NFC
  NfcManager.start();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://medication.kih.co.id/api/login', {
        username,
        password,
      });
      const { token } = response.data;
      const { name, id, sbu } = response.data.user;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userSbu', sbu);
      await AsyncStorage.setItem('userId', String(id));

      router.push('(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

 const readNdef = async () => {
  const isSupported = await NfcManager.isSupported();
  if (!isSupported) {
    Alert.alert('NFC not ready', 'Your Device does not support NFC');
    return;
  }

  const isEnabled = await NfcManager.isEnabled();
  if (!isEnabled) {
    Alert.alert('NFC Off', 'Please turn on your NFC');
    return;
  }

  setNfcPopupVisible(true);
  setNfcSuccess(false);
  setLoadingNfc(false); // Set loading to true

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();

    if (tag && tag.id) {
      setNfcTagId(tag.id);
       setLoadingNfc(true);
      // Kirim tag.id ke API untuk login
      const response = await axios.post('https://medication.kih.co.id/api/nfc-login', {
        rfid_code: tag.id,
      });

      if (response.data && response.data.token) {
        const { token, user } = response.data;

        // Simpan data di AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userName', user.name);
        await AsyncStorage.setItem('userSbu', user.sbu);
        await AsyncStorage.setItem('userId', String(user.id));

        setNfcSuccess(true);
        router.push('(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid NFC tag.');
      }
    } else {
      Alert.alert('Error', 'NFC tag not detected.');
    }
  } catch (ex) {
    Alert.alert('Error', 'Cannot read NFC tag.');
  } finally {
    setLoadingNfc(false); // Set loading to false
    setNfcPopupVisible(false);
    NfcManager.cancelTechnologyRequest();
  }
};




  return (
    <View style={styles.container}>
     <Text style={styles.titleversion}>v 1.0.0</Text>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.appName}>DRUG DISPENSING</Text>
      </View>

      <View style={styles.cardContainer}>
        <Image source={require('../../assets/images/26.webp')} style={styles.backgroundImage} />

        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <Button title="Login" onPress={handleLogin} />
          )}

          {/* Button for RFID Login */}
          <TouchableOpacity style={styles.rfidButton} onPress={readNdef}>
            <Text style={styles.rfidButtonText}>Login with RFID</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Popup for NFC */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={nfcPopupVisible}
        onRequestClose={() => setNfcPopupVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

             {loadingNfc ? (
              <Text style={styles.modalTitle}>Scan Success, Please Wait</Text>
            ) : nfcSuccess ? (
              <Text style={styles.modalTitle}>Ready to Scan</Text>

             ) : (
              <Text style={styles.modalTitle}>Success</Text>

              )}


            {loadingNfc ? (

              <ActivityIndicator size="large" color="#72e4ff" />
            ) : nfcSuccess ? (
              <>
                <Image
                  source={require('../../assets/images/check.png')}
                  style={styles.modalImage}
                />
                <Text style={styles.nfcTagText}>NFC Tag ID: {nfcTagId}</Text>
              </>
            ) : (
              <Image
                source={require('../../assets/images/nfc.png')}
                style={styles.modalImage}
              />
            )}

            <Pressable
              style={styles.cancelButton}
              onPress={() => setNfcPopupVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00acda',
  },
     titleversion: {
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#fff',
      bottom:30,
      position:'fixed',
    },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  nfcTagText: {
  fontSize: 16,
  color: '#333',
  marginTop: 10,
  textAlign: 'center',
},

  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardContainer: {
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '200%',
    borderRadius: 12,
  },
  card: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 219, 235, 0.9)',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  rfidButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  rfidButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LoginScreen;

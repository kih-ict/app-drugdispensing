import { StyleSheet, Image, Platform, Alert, Button, View, TextInput, Modal, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

NfcManager.start();

export default function TabTwoScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await axios.post(
          'https://medication.kih.co.id/api/logout',
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await AsyncStorage.removeItem('userToken');
        Alert.alert('Logout', 'You have successfully logged out.');
        router.replace('/login/login');
      } else {
        Alert.alert('Logout', 'No active session found.');
        router.replace('/login/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'An error occurred during logout. Please try again.');
    }
  };

  // Fungsi untuk menampilkan modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Fungsi untuk memulai scanning RFID
  const handleAddRFID = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setIsScanning(true);
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      const rfidCode = tag.id;

      const token = await AsyncStorage.getItem('userToken');
      const storedId = await AsyncStorage.getItem('userId');
      if (token) {
        // Kirim data ke API
        await axios.post(
          'https://medication.kih.co.id/api/addrfid',
          { id: storedId, rfid_code: rfidCode, password },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        Alert.alert('Success', 'RFID login added successfully!');
      }
    } catch (error) {
      console.error('Error adding RFID login:', error);
      Alert.alert('Error', 'Failed to add RFID login. Please try again.');
    } finally {
      setIsScanning(false);
      NfcManager.cancelTechnologyRequest();
      closeModal();
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.btnmargin}>
      <Button title="Add RFID Login" style={styles.btnlist} onPress={showModal} color={Platform.OS === 'ios' ? '#007AFF' : '#007AFF'} />
      </View>
      <View style={styles.btnmargin}>
      <Button title="Logout" style={styles.btnlogout} onPress={handleLogout} color={Platform.OS === 'ios' ? '#007AFF' : '#fc6f79'} />
      </View>
      {/* Modal Popup */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.buttonContainer}>
              <Button
                title={isScanning ? 'Scanning...' : 'Confirm'}
                onPress={handleAddRFID}
                disabled={isScanning}
                color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'}
              />
              <Button
                title="Cancel"
                onPress={closeModal}
                color={Platform.OS === 'ios' ? '#007AFF' : '#fc6f79'}
               />
             </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 220,
  },
    btnmargin: {
     marginBottom:5,
    },
  btnlist:{
      marginBottom:10,
      backgroundColor:'#ccc',
      },
   btnlogout:{
        marginBottom:10,
        backgroundColor:'#f23857',
        },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

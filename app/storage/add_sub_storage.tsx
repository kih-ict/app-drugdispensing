import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Untuk token
import axios from 'axios'; // Untuk request API
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

const AddSubStorage = ({ route }) => {
  const [name, setName] = useState(''); // Input nama sub-storage
  const [loading, setLoading] = useState(false); // Loading state untuk request
  const router = useRouter(); // Menginisialisasi router untuk navigasi
   const { storageId } = useLocalSearchParams(); // Mengambil storageId dari parameter navigasi


  const handleAddSubStorage = async () => {
    // Validasi input
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required!');
      return;
    }

    setLoading(true); // Set loading saat request dimulai

    try {
      // Ambil token dari AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      const storedId = await AsyncStorage.getItem('userId');
      if (!token) {
        Alert.alert('Authentication Error', 'Token not found! Please log in again.');
        return;
      }

      // Kirim data ke API menggunakan POST
      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/Storage/Sub/List/Add',
        { name: name, storageId: storageId, user: storedId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Tambahkan token sebagai Bearer
          },
        }
      );

      // Jika berhasil, tampilkan pesan sukses
      Alert.alert('Success', 'Sub-Storage added successfully!', [
        { text: 'OK', onPress: () => router.back() }, // Kembali ke halaman sebelumnya
      ]);

      setName(''); // Reset input
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add sub-storage. Please try again later.'
      );
    } finally {
      setLoading(false); // Selesai request
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Sub-Storage</Text>

      {/* Input Name */}
      <TextInput
        style={styles.input}
        placeholder="Enter sub-storage name"
        value={name}
        onChangeText={setName}
      />

      {/* Button untuk Submit */}
      <Button
        title={loading ? 'Adding...' : 'Add Sub-Storage'}
        onPress={handleAddSubStorage}
        disabled={loading} // Disable saat loading
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default AddSubStorage;

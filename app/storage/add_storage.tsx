import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Untuk token
import axios from 'axios'; // Untuk request API
import { useRouter } from 'expo-router'; // Import useRouter untuk navigasi

const AddStorage = () => {
  const [name, setName] = useState(''); // Input nama storage
  const [description, setDescription] = useState(''); // Input deskripsi storage
  const [loading, setLoading] = useState(false); // Loading state untuk request
  const router = useRouter(); // Menginisialisasi router untuk navigasi

  const handleAddStorage = async () => {
  // Validasi input
  if (!name.trim() || !description.trim()) {
    Alert.alert('Validation Error', 'Both Name and Description are required!');
    return;
  }

  setLoading(true); // Set loading saat request dimulai

  try {
    // Ambil token dari AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    const storedId = await AsyncStorage.getItem('userId');
    const storedSbu = await AsyncStorage.getItem('userSbu');
    if (!token) {
      Alert.alert('Authentication Error', 'Token not found! Please log in again.');
      return;
    }

    // Kirim data ke API menggunakan POST
    const response = await axios.post(
      'https://medication.kih.co.id/api/Item/Storage/List/Add',
      { name: name, description: description, sbu: storedSbu, user: storedId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Tambahkan token sebagai Bearer
        },
      }
    );

    // Jika berhasil, tampilkan pesan sukses
    Alert.alert('Success', 'Storage added successfully!', [
      { text: 'OK', onPress: () => router.back() }, // Kembali ke halaman sebelumnya
    ]);

    setName(''); // Reset input
    setDescription('');
  } catch (error) {
    console.error('Error:', error);
    Alert.alert(
      'Error',
      error.response?.data?.message || 'Failed to add storage. Please try again later.'
    );
  } finally {
    setLoading(false); // Selesai request
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Storage</Text>

      {/* Input Name */}
      <TextInput
        style={styles.input}
        placeholder="Enter storage name"
        value={name}
        onChangeText={setName}
      />

      {/* Input Description */}
      <TextInput
        style={styles.input}
        placeholder="Enter storage description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
      />

      {/* Button untuk Submit */}
      <Button
        title={loading ? 'Adding...' : 'Add Storage'}
        onPress={handleAddStorage}
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

export default AddStorage;

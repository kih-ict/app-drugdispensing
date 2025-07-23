import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EditLoket() {
  const { drugid,IDStorage } = useLocalSearchParams(); // Ambil parameter drugid dari URL
  const router = useRouter(); // Untuk navigasi
  const [loketList, setLoketList] = useState([]); // State untuk daftar loket
  const [loketNumber, setLoketNumber] = useState(''); // State untuk nomor loket yang dipilih
  const [subLoketList, setSubLoketList] = useState([]); // State untuk daftar sub loket
  const [selectedSubLoket, setSelectedSubLoket] = useState(''); // State untuk sub loket yang dipilih
  const [loading, setLoading] = useState(false); // Indikator loading
  const [subLoading, setSubLoading] = useState(false); // Indikator loading untuk sub loket

  // Ambil daftar loket dari API saat komponen dimuat
  useEffect(() => {
    const fetchLoketList = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedSbu = await AsyncStorage.getItem('userSbu');
        if (!token) {
          console.error('Cant find token');
          return;
        }

        const response = await axios.post(
          'https://medication.kih.co.id/api/Item/Storage/List',
          { sbu: storedSbu },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Loket List Response:', response.data); // Debug respons
        if (response.data.success) {
          setLoketList(response.data.item || []); // Ambil daftar dari properti 'item'
        } else {
          Alert.alert('Error', response.data.message || 'Failed to fetch loket list.');
        }
      } catch (error) {
        console.error('Error fetching loket list:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch loket list.');
      }
    };

    fetchLoketList();
  }, []);

  // Fungsi untuk menangani perubahan nomor loket
  const handleLoketChange = async (loket) => {
    setLoketNumber(loket);
    setSubLoading(true);
    setSubLoketList([]); // Reset daftar sub loket

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Cant find token');
        return;
      }

      // Panggil API untuk mendapatkan sub loket
      const response = await axios.post(
        `https://medication.kih.co.id/api/Item/Storage/Sub/List`,
        { loketNumber: loket },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSubLoketList(response.data.item || []); // Update daftar sub loket
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch sub loket.');
      }
    } catch (error) {
      console.error('Error fetching sub loket:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch sub loket.');
    } finally {
      setSubLoading(false);
    }
  };

  // Fungsi untuk menangani pengiriman data
  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.error('Cant find token');
      return;
    }

    if (!loketNumber || !selectedSubLoket) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      setLoading(true); // Tampilkan indikator loading

      // API Update Loket
      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/Update/Loket',
        {
          drugid: IDStorage, // Kirim DrugID
          loketNumber: loketNumber, // Kirim Loket Number baru
          subLoket: selectedSubLoket, // Kirim Sub Loket
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Sukses', 'Storage Number Successfully Updated.');
      console.log('Response:', response.data);

      // Kembali ke halaman sebelumnya
      router.back();
    } catch (error) {
      console.error('Error updating loket:', error.response?.data || error.message);
      Alert.alert('Error', 'Error cant update storage Number.');
    } finally {
      setLoading(false); // Sembunyikan indikator loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Loket</Text>
      <Text style={styles.label}>Drug ID:</Text>
      <Text style={styles.value}>{drugid}</Text>

      <Text style={styles.label}>Nomor Loket:</Text>
      <Picker
        selectedValue={loketNumber}
        onValueChange={handleLoketChange}
        style={styles.input}
      >
        <Picker.Item label="Select Loket Number" value="" />
        {loketList.map((item) => (
          <Picker.Item key={item.LoketID} label={item.LoketName} value={item.LoketID} />
        ))}
      </Picker>

      <Text style={styles.label}>Sub Loket:</Text>
      {subLoading ? (
        <ActivityIndicator size="small" color="#007BFF" />
      ) : (
        <Picker
          selectedValue={selectedSubLoket}
          onValueChange={(itemValue) => setSelectedSubLoket(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Select Sub Loket" value="" />
          {subLoketList.map((item) => (
            <Picker.Item key={item.SubLoketID} label={item.SubLoketName} value={item.SubLoketID} />
          ))}
        </Picker>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Button title="Update Loket" onPress={handleUpdate} color="#007BFF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

export default function TabTtreeScreen() {
  const router = useRouter(); // Untuk navigasi
  const [loketList, setLoketList] = useState([]); // State untuk daftar loket
  const [loketNumber, setLoketNumber] = useState(''); // State untuk nomor loket yang dipilih
  const [subLoketList, setSubLoketList] = useState([]); // State untuk daftar sub loket
  const [selectedSubLoket, setSelectedSubLoket] = useState([]); // State untuk sub loket yang dipilih
  const [loading, setLoading] = useState(false); // Indikator loading
  const [subLoading, setSubLoading] = useState(false); // Indikator loading untuk sub loket
  const [checkingSession, setCheckingSession] = useState(true); // Status pengecekan session

  // Ambil daftar loket dari API saat komponen dimuat
  useFocusEffect(
    useCallback(() => {
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

            // Periksa data yang diterima dari API

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


      const checkAccess = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          const storedId = await AsyncStorage.getItem('userId');
          const storedSbu = await AsyncStorage.getItem('userSbu');

          if (!token) {
            console.error('Cant find token');
            return;
          }

          // Panggil API untuk mengecek akses
          const response = await axios.post(
            'https://medication.kih.co.id/api/checkStocktakeAccess',
            { userid: storedId, sbu: storedSbu },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (response.data.success && response.data.hasAccess) {
            // Jika sudah ada akses, arahkan ke halaman selanjutnya
            router.push('history/stockcheck'); // Ganti dengan halaman tujuan Anda
          }
        } catch (error) {
          console.error('Error checking access:', error.response?.data || error.message);
        } finally {
          setCheckingSession(false); // Selesai pengecekan session
        }
      };

      checkAccess();
      fetchLoketList();
    }, [router])
  );

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
        `https://medication.kih.co.id/api/Item/Storage/Sub/List/Access`,
        { loketNumber: loket },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log(response.data.item);
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

  // Fungsi untuk menambahkan atau menghapus sub loket yang dipilih
  const toggleSubLoket = (subLoket) => {
    setSelectedSubLoket((prevSelected) => {
      if (prevSelected.includes(subLoket)) {
        return prevSelected.filter((item) => item !== subLoket);
      } else {
        return [...prevSelected, subLoket];
      }
    });
  };

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const storedSbu = await AsyncStorage.getItem('userSbu');
    const storedId = await AsyncStorage.getItem('userId');

    if (!token) {
      console.error('Cant find token');
      return;
    }

    if (!loketNumber || selectedSubLoket.length === 0) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        'https://medication.kih.co.id/api/stocktake_access',
        {
          userid: storedId,
          sbu: storedSbu,
          loketNumber: loketNumber,
          subLoket: selectedSubLoket,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Storage Number Successfully Updated.');
        router.push('history/stockcheck'); // Arahkan ke halaman selanjutnya
      } else {
        const unavailable = response.data.unavailableSubLokets.join(', ');
        Alert.alert('Error', `Sub Lokets already taken: ${unavailable}`);
      }
    } catch (error) {
      console.error('Error updating loket:', error.response?.data || error.message);
      Alert.alert('Error', 'Error cant update storage Number.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.title}>Checking Session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Part</Text>

      <Text style={styles.label}>Shelf Name:</Text>
      <Picker
        selectedValue={loketNumber}
        onValueChange={handleLoketChange}
        style={styles.input}
      >
        <Picker.Item label="Select Loket Number" value="" />
        {loketList.map((item) => (
          <Picker.Item key={item.LoketID} label={item.LoketName || 'No Name'} value={item.LoketID} />
        ))}
      </Picker>

      <Text style={styles.label}>Shelf Row:</Text>
      {subLoading ? (
        <ActivityIndicator size="small" color="#007BFF" />
      ) : (
       <FlatList
  data={subLoketList}
  keyExtractor={(item) => item.SubLoketID}
  numColumns={4} // Membuat grid dengan 4 kolom
  renderItem={({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.userid ? styles.unavailableItem : null, // Tambahkan gaya jika userid tidak kosong
        selectedSubLoket.includes(item.SubLoketID) && !item.userid && styles.selectedItem, // Hanya ubah warna jika dipilih dan userid kosong
      ]}
      onPress={() => !item.userid && toggleSubLoket(item.SubLoketID)} // Hanya bisa ditekan jika userid kosong
      disabled={!!item.userid} // Nonaktifkan tombol jika userid tidak kosong
    >
      <Text
        style={[
          styles.itemText,
          item.userid ? styles.unavailableItemText : null, // Ubah gaya teks jika userid tidak kosong
          selectedSubLoket.includes(item.SubLoketID) && !item.userid && styles.selectedItemText,
        ]}
      >
        {item.LoketName}{item.SubLoketName}
      </Text>
    </TouchableOpacity>
  )}
  columnWrapperStyle={styles.row} // Gaya baris untuk mengatur jarak antar kolom
/>

      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Button title="Select" onPress={handleUpdate} color="#007BFF" />
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    padding: 5,
    fontSize: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row', // Pastikan layout kolom disusun dalam baris
    justifyContent: 'space-between', // Mengatur jarak antar kolom
    marginBottom: 10, // Jarak antar baris
  },
  item: {
    flex: 1, // Membagi ruang secara merata di setiap kolom
    padding: 15,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 5, // Jarak antar kotak
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(52, 219, 235, 0.9)',
    borderColor: 'rgba(52, 219, 235, 0.9)',
  },
  itemText: {
    color: '#333',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#fff', // Ubah warna teks jika dipilih
  },
  unavailableItem: {
    backgroundColor: '#FFD700', // Warna kuning untuk sub loket yang tidak bisa dipilih
    borderColor: '#FFD700',
  },
  unavailableItemText: {
    color: '#333', // Warna teks default untuk sub loket yang tidak bisa dipilih
  },
});


import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

const RackListScreen = () => {
  const [racks, setRacks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [fetched, setFetched] = useState(false); // Track if data has been fetched

  // Ambil data dari API menggunakan metode POST
  const fetchData = async () => {
    setLoading(true);
    try {
      const storedSbu = await AsyncStorage.getItem('userSbu');
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token tidak ditemukan');
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
      setRacks(response.data.item || []);
      setFetched(true); // Mark data as fetched
    } catch (error) {
      console.error('Error fetching racks:', error);
      Alert.alert('Error', 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // Panggil fetchData hanya sekali saat halaman mendapatkan fokus, jika belum di-fetch
   useFocusEffect(
    useCallback(() => {
     
        fetchData(); // Panggil fetchData saat halaman mendapatkan fokus

    }, [fetched])
  );


  // Filter daftar rak berdasarkan teks pencarian
  const filteredRacks = racks.filter((rack) =>
    rack.LoketName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Tombol tambah storage
  const handleAddStorage = () => {
    router.push('storage/add_storage');
  };

  // Tombol tambah sub untuk masing-masing storage
  const handleAddSub = (storageId) => {
    router.push(`storage/sub_storage_list?storageId=${storageId}`);
  };

  const renderRackItem = ({ item }) => (
    <View style={styles.rackItem}>
      <Text style={styles.rackCode}>{item.LoketName}</Text>
      <Text style={styles.rackDescription}>{item.Description || 'No description available'}</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddSub(item.LoketID)}>
        <Text style={styles.addButtonText}>Tambah Sub</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Image
          source={require('../../assets/images/bt1.jpg')} // Ganti dengan URL atau path gambar Anda
          style={styles.backgroundImage}
        />
        <View style={styles.card}>
          <Text style={styles.balanceText}>Storage List</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kode rak..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={filteredRacks}
          keyExtractor={(item) => item.LoketID.toString()}
          renderItem={renderRackItem}
          ListEmptyComponent={() => (
            <Text style={styles.emptyMessage}>Tidak ada kode rak yang ditemukan.</Text>
          )}
        />
      )}
      <TouchableOpacity style={styles.addStorageButton} onPress={handleAddStorage}>
        <Text style={styles.addStorageButtonText}>Tambah Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardContainer: {
    position: 'relative',
  },
  card: {
    backgroundColor: 'rgba(52, 219, 235, 0.9)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 55,
  },
  rackItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rackCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rackDescription: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  addStorageButton: {
    backgroundColor: '#34dceb',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  addStorageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default RackListScreen;

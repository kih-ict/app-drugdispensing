import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useFocusEffect,useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubStorageListScreen = () => {
  const { storageId } = useLocalSearchParams(); // Mengambil storageId dari parameter navigasi
  const [subStorages, setSubStorages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fungsi untuk mengambil data sub storage
  const fetchSubStorages = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token tidak ditemukan');
        Alert.alert('Error', 'Token tidak ditemukan. Silakan login ulang.');
        return;
      }

      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/Storage/Sub/List',
        { loketNumber: storageId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSubStorages(response.data.item || []);
      } else {
        Alert.alert('Error', response.data.message || 'Gagal memuat data sub storage.');
      }
    } catch (error) {
      console.error('Error fetching sub storage:', error.response?.data || error.message);
      Alert.alert('Error', 'Terjadi kesalahan saat memuat data sub storage.');
    } finally {
      setLoading(false);
    }
  };

  // Memuat data saat halaman difokuskan
  useFocusEffect(
    React.useCallback(() => {
      fetchSubStorages();
    }, [storageId])
  );

  // Filter daftar sub storage berdasarkan teks pencarian
  const filteredSubStorages = subStorages.filter((subStorage) =>
    subStorage.SubLoketName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderSubStorageItem = ({ item }) => (
    <View style={styles.subStorageItem}>
      <Text style={styles.subStorageCode}>{item.SubLoketName}</Text>
      <Text style={styles.subStorageDescription}>{item.Description || 'No description available'}</Text>
    </View>
  );

  // Handler untuk tombol Add Sub
  const handleAddSub = () => {

    router.push(`storage/add_sub_storage?storageId=${storageId}`);
    // Anda bisa menavigasi ke halaman baru menggunakan router.push('/path-to-add-sub')
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Image
          source={require('../../assets/images/bt1.jpg')} // Ganti dengan URL atau path gambar Anda
          style={styles.backgroundImage}
        />
        <View style={styles.card}>
          <Text style={styles.balanceText}>Sub Storage List</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari sub storage..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={filteredSubStorages}
          keyExtractor={(item) => item.SubStorageID?.toString() || Math.random().toString()}
          renderItem={renderSubStorageItem}
          ListEmptyComponent={() => (
            <Text style={styles.emptyMessage}>Tidak ada sub storage yang ditemukan.</Text>
          )}
        />
      )}
      {/* Tombol Add Sub */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSub}>
        <Text style={styles.addButtonText}>Add Sub</Text>
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
  subStorageItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subStorageCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subStorageDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#34dceb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SubStorageListScreen;

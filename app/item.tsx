import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator, TextInput,Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link, useFocusEffect } from 'expo-router';

const Item = () => {
  const [items, setItems] = useState<any[]>([]); // State untuk menyimpan daftar item
  const [filteredItems, setFilteredItems] = useState<any[]>([]); // State untuk item yang difilter
  const [loading, setLoading] = useState(true); // State untuk loading indikator
  const [searchText, setSearchText] = useState(''); // State untuk teks pencarian
  const router = useRouter(); // Menggunakan router dari expo-router

  const fetchItems = async () => {
    try {
      setLoading(true); // Tampilkan indikator loading
      const storedSbu = await AsyncStorage.getItem('userSbu');
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }

      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/List', // Ganti dengan URL API Anda
        {sbu:storedSbu},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems(response.data.item);
      setFilteredItems(response.data.item); // Simpan data item untuk pencarian
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false); // Sembunyikan indikator loading
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filtered = items.filter((item) =>
        item.DrugName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items); // Jika tidak ada input pencarian, tampilkan semua item
    }
  };

  // Panggil fetchItems saat halaman ini difokuskan
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.DrugID}</Text>
        <Text style={styles.itemDetail}>{item.DrugName}</Text>
        <Text style={styles.itemDetail}>Shelf: {item.LoketName}-{item.SubLoketName}</Text>
      </View>
      <Link
        style={styles.editButton}
        key={item.DrugID}
        href={{
          pathname: 'editloket/[drugid]',
          params: { drugid: item.DrugID,IDStorage:item.IDStorage },
        }}
      >
        Edit
      </Link>
    </View>
  );

  return (
    <View style={styles.container}>
   
    <View style={styles.cardContainer}>
     <Image
          source={require('../assets/images/bt1.jpg')} // Ganti dengan URL atau path gambar Anda
          style={styles.backgroundImage}
        />
    <View style={styles.card}>
    <Text style={styles.balanceText}>Item List</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by drug name"
        value={searchText}
        onChangeText={handleSearch}
      />
      </View>
    </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.DrugID.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop:55,
  },
  cardContainer: {
    
    position: 'relative', 
  },
  card: {
    backgroundColor: 'rgba(52, 219, 235, 0.9)', // Transparansi agar terlihat lebih menarik
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
    position: 'absolute', // Menempatkan gambar di belakang card
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 12, // Menambahkan radius sesuai bentuk kartu
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop:50,
    fontSize: 16,
    backgroundColor:'#fff',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    padding:10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 10,
    backgroundColor: 'rgba(52, 219, 235, 0.9)',
    borderRadius: 5,
    color: 'white',
  },
});

export default Item;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter,useFocusEffect  } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

export default function StockCheck() {
  const router = useRouter();
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(false);

useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert(
          'Warning',
          'Please press the Exit Page button to leave this page.',
          [{ text: 'OK', onPress: () => {} }]
        );
        return true; // Mencegah aksi default tombol back
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => {
        backHandler.remove();
      };
    }, [])
  );
  useEffect(() => {
    fetchScanHistory();
   
  }, []);

  const fetchScanHistory = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const storedId = await AsyncStorage.getItem('userId');
    const storedSbu = await AsyncStorage.getItem('userSbu');
    try {
      if (!token) {
        Alert.alert('Error', 'Token not found');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'https://medication.kih.co.id/api/liststocktake',
        { id: storedId, sbu: storedSbu },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setScanHistory(response.data.item);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching scan history:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToScan = () => {
    router.push('history/scancheck');
  };

  // Fungsi untuk logout
  const handleLogout = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const storedId = await AsyncStorage.getItem('userId');
    try {
      const response = await axios.post(
        'https://medication.kih.co.id/api/remove_access',
        {id:storedId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        router.push('(tabs)'); // Arahkan ke halaman login
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const renderHistoryItem = ({ item, index }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{`${index + 1}. ${item.DrugName} - ${item.ItemCode}`}</Text>
      <Text style={styles.historySubText}>{`Stock: ${item.ActualStock}`}</Text>
      <Text style={styles.historySubText}>{`Selft: ${item.LoketName}${item.SubLoketName}-${item.subStorage}`}</Text>
      <Text style={styles.historySubText}>{`Remark: ${item.description}`}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#e0e0e0' }]}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stock Check</Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleNavigateToScan}>
          <Icon name="camera" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Scan History:</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={scanHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderHistoryItem}
          style={styles.historyList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No scan history available.</Text>
          }
        />
      )}

      {/* Tombol Keluar */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>EXIT PAGE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyList: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  historySubText: {
    fontSize: 12,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007BFF',
    marginVertical: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B3B',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


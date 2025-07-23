import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Button,
  BackHandler,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CompleteObat() {
  const { prn, account_no } = useLocalSearchParams();
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchDrugsFromAPI = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const userSbu = await AsyncStorage.getItem('userSbu');

      if (!token || !userId || !userSbu) {
        throw new Error('Data login tidak lengkap.');
      }

      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/Dispensed/Prn',
        { id: userId, sbu: userSbu, prn, message: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const drugs = response.data.data || [];
      const filtered = drugs.filter((item) => item.patientPrn === prn);
      setFilteredDrugs(filtered);

      const allComplete = filtered.every((drug) => drug.status === '2');
      if (allComplete) {
        Alert.alert('Order Complete', 'Patient Verified');
      }
    } catch (error) {
      console.error('Failed to fetch drugs:', error);
      Alert.alert('Error', 'Gagal memuat data obat.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdukasiSelesai = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin edukasi telah selesai?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Selesai',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');

            if (!token || !userId) {
              Alert.alert('Error', 'Data login tidak lengkap.');
              return;
            }

            await axios.post(
              'https://medication.kih.co.id/api/farmasi_edukasi',
              { account_no, user: userId },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            Alert.alert('Sukses', 'Edukasi selesai!');
            router.push('(tabs)');
          } catch (err) {
            Alert.alert('Error', 'Gagal menyelesaikan edukasi.');
          }
        },
      },
    ]);
  };

  const handleScan = (drugId) => {
    Alert.alert('Scan Obat', `Melakukan scan untuk drug ID: ${drugId}`);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.push('(tabs)');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      fetchDrugsFromAPI();
    }, [prn])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Image
          source={require('../../assets/images/bt1.jpg')}
          style={styles.backgroundImage}
        />
        <View style={styles.card}>
          <Text style={styles.balanceText}>List of Medications for PRN: {prn}</Text>
        </View>
      </View>

      {filteredDrugs.length > 0 ? (
        <FlatList
          data={filteredDrugs}
          keyExtractor={(item) => item.orderId.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemLabel}>Item Code:</Text>
                <Text style={styles.itemValue}>{item.drugId}</Text>

                <Text style={styles.itemLabel}>Drug Name:</Text>
                <Text style={styles.itemValue}>{item.drugName}</Text>

                <Text style={styles.itemLabel}>Drug Quantity:</Text>
                <Text style={styles.itemValue}>{item.quantity}</Text>

                <Text style={styles.itemLabel}>Drug Uom:</Text>
                <Text style={styles.itemValue}>{item.uom}</Text>

                <Text style={styles.itemLabel}>Shelf:</Text>
                <View style={styles.shelfContainer}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: item.color || '#666' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: item.color === '#fff' ? '#000' : '#fff' },
                      ]}
                    >
                      {item.loketName}
                      {item.subloket}-{item.sub_storage}
                    </Text>
                  </View>
                </View>
              </View>
              {item.status === '2' ? (
                <MaterialCommunityIcons name="check-circle" size={24} color="green" />
              ) : (
                <Button title="Scan" onPress={() => handleScan(item.drugId)} />
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>There is no medication for this PRN.</Text>
      )}

      <View style={{ margin: 16 }}>
        <Button title="Complete Education" color="green" onPress={handleEdukasiSelesai} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  shelfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemDetails: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemValue: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 55,
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
});

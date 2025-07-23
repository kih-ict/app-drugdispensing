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
  RefreshControl,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios'; // Tambahkan axios


export default function ListObat() {
  const { prn } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();


  const [filteredDrugs, setFilteredDrugs] = useState([]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const storedId = await AsyncStorage.getItem('userId');
      const storedSbu = await AsyncStorage.getItem('userSbu');

      if (!token || !storedId || !storedSbu) {
        throw new Error('Data login tidak lengkap.');
      }

      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/Dispensed/Prn',
        { id: storedId, sbu: storedSbu, prn, message: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (data.success) {
        const formattedDrugs = data.item.map((drug) => ({
          orderId: drug.OrderID,
          drugId: drug.DrugID,
          drugName: drug.DrugName,
          status: drug.Status,
          createdAt: drug.created_at,
          updatedAt: drug.updated_at,
          sbu: drug.sbu,
          patientPrn: drug.PatientPrn,
          patientAccount: drug.PatientAccount,
          loketNumber: drug.LoketNumber,
          loketName: drug.LoketName,
          subloket: drug.SubLoketName,
          quantity: drug.Quantity,
          uom: drug.Uom,
          sub_storage: drug.sub_storage,
          color: drug.LoketColor || '#bfbfbf',
        }));


        setFilteredDrugs(formattedDrugs);

        const allComplete = formattedDrugs.every((drug) => drug.status === '2');

        if (allComplete) {
          router.replace(
            `verifikasi/complate?prn=${formattedDrugs[0]?.patientPrn}&account_no=${formattedDrugs[0]?.patientAccount}`
          );
        }
      } else {
        Alert.alert('Error', data.message || 'PRN not found.', [
          { text: 'OK', onPress: () => router.push('(tabs)') },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'PRN not found.', [
        { text: 'OK', onPress: () => router.push('(tabs)') },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.push('(tabs)');
        return true;
      };
     fetchDrugs();
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const handleScan = (drugId) => {
    router.push(`verifikasi_obat/scan_obat?code=${drugId}&prn=${prn}`);
  };

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
        <Image source={require('../../assets/images/bt1.jpg')} style={styles.backgroundImage} />
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
                <Text style={styles.itemLabel}>Drug UOM:</Text>
                <Text style={styles.itemValue}>{item.uom}</Text>
                <Text style={styles.itemLabel}>Shelf:</Text>
                <View style={styles.shelfContainer}>
                  <View style={[styles.badge, { backgroundColor: item.color }]}>
                    <Text style={[styles.badgeText, { color: item.color === '#fff' ? 'black' : 'white' }]}>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDrugs} />}
        />
      ) : (
        <Text style={styles.noDataText}>There is no cure for this PRN.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
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

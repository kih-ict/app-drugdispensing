import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function UserList() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState('');
 const [sbu, setSbu] = useState('');

 useEffect(() => {
  const initializeData = async () => {
    const storedId = await AsyncStorage.getItem('userId');
    const storedSbu = await AsyncStorage.getItem('userSbu');
    const token = await AsyncStorage.getItem('userToken');

    if (storedId) setId(storedId);
    if (storedSbu) setSbu(storedSbu);

    if (storedId && storedSbu && token) {
      try {
        const response = await axios.post(
          'https://medication.kih.co.id/api/Item/Dispensed',
          { id: storedId, sbu: storedSbu },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = response.data;

        if (data.success) {
          const formattedPatients = data.item.map((patient) => ({
            medicalNumber: patient.account_number,
            name:  patient.patient_prn,
            drugs: patient.ordered_code
              .split(', ')
              .map((code, index) => ({
                code,
                name: patient.ordered_drugs.split(', ')[index] || 'Unknown Drug',
              })),
          }));
          setPatients(formattedPatients);
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to fetch patient data');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Missing required information');
      setLoading(false);
    }
  };

  initializeData();
}, []);


  // Render item untuk FlatList
 const renderPatientCard = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>KIH PHARMACY</Text>
    <Text>Nomor Medis: {item.medicalNumber}</Text>
    <Text>Prn: {item.name}</Text>
    <View style={styles.drugsList}>
      <Text>Daftar Obat:</Text>
      {item.drugs.map((drug, index) => (
        <Text key={index} style={styles.drugItem}>
          {index + 1}. {drug.code} - {drug.name}
        </Text>
      ))}
    </View>
    <Text style={styles.footer}>
      
    </Text>
    <Button
      title="Scan & Verifikasi"
      onPress={() => router.push(`/verifikasi/scan?medicalNumber=${item.name}`)}
    />
  </View>
);


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.medicalNumber}
          renderItem={renderPatientCard}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop:40,
    backgroundColor: '#f8f9fa',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 0, // Menghilangkan rounded corner
    borderWidth: 1,
    borderColor: '#ddd', // Warna border tipis
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    fontFamily: 'Courier New', // Font menyerupai struk
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    textDecorationLine: 'underline', // Garis bawah untuk heading
  },
  drugsList: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  drugItem: {
    fontSize: 12,
    marginVertical: 2,
    fontFamily: 'Courier New', // Font menyerupai struk
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginTop: 8,
    paddingTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Courier New',
  },
});


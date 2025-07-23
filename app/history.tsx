import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView,Image, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useRouter } from 'expo-router';

const History = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [id, setId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<string>(''); // Filter tanggal
  const [showPicker, setShowPicker] = useState<boolean>(false); // Kontrol untuk menampilkan datetime picker
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Tanggal yang dipilih
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      if (storedId) {
        setId(storedId);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const requestBody: any = { id: id };
          if (date) {
            requestBody.date = date; // Tambahkan tanggal jika tersedia
          }

          const response = await axios.post(
            `https://medication.kih.co.id/api/Proses/Item/History/Prn`,
            requestBody,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setScanHistory(response.data.item || []);
          setApiMessage(response.data.message);
        } else {
          setApiMessage('No token found');
        }
      } catch (error) {
        console.error('Error:', error);
        setApiMessage('Failed to fetch data from the server.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistory();
    }
  }, [id, date]);

  const onDateChange = (event: any, selected: Date | undefined) => {
    setShowPicker(false); // Sembunyikan picker setelah memilih
    if (selected) {
      setSelectedDate(selected);
      setDate(selected.toISOString().split('T')[0]); // Format tanggal ke YYYY-MM-DD
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.fixedContainer}>
          <Image
            source={require('../assets/images/bt1.jpg')} // Ganti dengan URL atau path gambar Anda
            style={styles.backgroundImage}
          />
          <View style={styles.card2}>
            <Text style={styles.balanceText}>Scan History</Text>

          {/* Tombol untuk membuka DateTime Picker */}
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
              {date ? `${date}` : 'Select a Date'}
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      

      {/* DateTime Picker */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onDateChange}
        />
      )}

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <ScrollView style={styles.historyList}>
          {scanHistory.length > 0 ? (
            scanHistory.map((data, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cardContainer}
                onPress={() => router.push(`history/detail?accountNumber=${data.PatientAccount}&PrnNumber=${data.PatientPrn}`)}
              >
                <Text style={styles.cardTitle}>Account Number: {data.PatientAccount}</Text>
                <Text style={styles.cardTitle}>Prn: {data.PatientPrn}</Text>
                <Text style={styles.cardText}>Created At: {data.created_at}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noHistory}>No history found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  dateButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 0,
    marginTop:20
  },
  dateButtonText: { color: '#000', textAlign: 'center', marginLeft:40,marginRight:40 },
  loadingText: { fontSize: 16, color: '#333', marginTop: 20 },
  historyList: { marginTop: 20 },
  cardContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardText: { fontSize: 14, marginTop: 5 },
  noHistory: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 20 },
  // Background dan posisi judul yang tetap
  card2: {
    backgroundColor: 'rgba(52, 219, 235, 0.9)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Menjaga agar tetap berada di atas
    height: 170,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Gambar Latar Belakang
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '80%',
    borderRadius: 12,
  },
  fixedContainer: {
   
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Menjaga agar tetap di atas

  },
});

export default History;

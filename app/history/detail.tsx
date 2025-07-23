import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Detail = () => {
  const { accountNumber,PrnNumber } = useLocalSearchParams(); // Mengambil parameter
  const [drugDetails, setDrugDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchDrugDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('Token not found');

        const response = await axios.post(
          `https://medication.kih.co.id/api/Proses/Item/History/Prn/Detail`,
          { accountNumber }, // Body request
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setDrugDetails(response.data.item || []);
        } else {
          setErrorMessage(response.data.message || 'Failed to fetch details');
        }
      } catch (error) {
        setErrorMessage('An error occurred while fetching data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (accountNumber) fetchDrugDetails();
  }, [accountNumber]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bagian untuk Detail yang tetap di atas */}
      <View style={styles.fixedContainer}>
        <Image
          source={require('../../assets/images/bt1.jpg')} // Ganti dengan URL atau path gambar Anda
          style={styles.backgroundImage}
        />
        <View style={styles.card2}>
          <Text style={styles.balanceText}>{accountNumber}</Text>
          <Text style={styles.balanceText}>{PrnNumber}</Text>
        </View>
      </View>

      {/* Konten yang dapat di-scroll */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.containercard}>
          {drugDetails.length > 0 ? (
            drugDetails.map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{item.DrugName}</Text>
                <Text style={styles.cardText}>Quantity: {item.Quantity} {item.Uom}</Text>
                <Text style={styles.cardText}>Order ID: {item.OrderID}</Text>

                {/* Badge untuk Status */}
                <View style={[styles.badge, item.Status === "1" ? styles.badgeYellow : styles.badgeGreen]}>
                  <Text style={styles.badgeText}>
                    {item.Status === "1" ? "On Proses" : "Verified"}
                  </Text>
                </View>

                <Text style={styles.cardText}>Created At: {item.created_at}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No drug details found for this account.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fixedContainer: {
   
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Menjaga agar tetap di atas

  },
  scrollView: {
      // Memberikan margin-top agar konten tidak tertutup oleh judul tetap
  },
  containercard: { marginBottom: 50, padding:20 },
  card: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardText: { fontSize: 16, marginBottom: 5 },
  noDataText: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginHorizontal: 20 },

  // Badge Styling
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  badgeYellow: {
    backgroundColor: '#f5a43b',
  },
  badgeGreen: {
    backgroundColor: 'green',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

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
});

export default Detail;

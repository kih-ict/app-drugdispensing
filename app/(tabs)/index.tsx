import { Alert,TextInput, Image, StyleSheet,TouchableOpacity, View, Animated, Pressable, Text, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'; // Untuk mengirim permintaan API
import ParallaxScrollView from '../../components/ParallaxScrollView';

export default function HomeScreen() {
  const [name, setName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [recentScans, setRecentScans] = useState([]); // State untuk data recent scans
  const [hasNavigated, setHasNavigated] = useState(false);
  const router = useRouter();
  const [id, setId] = useState('');
  const [sbu, setSbu] = useState('');

  // Mendapatkan nama pengguna dan data recent scans setelah komponen dirender
  useEffect(() => {
    const fetchUserName = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        setName(storedName);
      }
    };

    fetchUserName();
    fetchRecentScans(); // Memuat data recent scans
  }, []);

const handleFocus = () => {
    if (!hasNavigated) {
      setHasNavigated(true); // Set state navigasi telah dilakukan
      router.push('/item');  // Navigasi ke halaman pencarian
    }
  };
  // Fungsi untuk mengambil data recent scans dari API
  const fetchRecentScans = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      const storedSbu = await AsyncStorage.getItem('userSbu');
      const token = await AsyncStorage.getItem('userToken');

      // Cek apakah data tersedia
      if (!storedId || !storedSbu || !token) {
        console.error('Missing required data from AsyncStorage');
        return;
      }

      if (storedId) setId(storedId);
      if (storedSbu) setSbu(storedSbu);

      const response = await axios.post(
        'https://medication.kih.co.id/api/Item/Recent/Scan',
        { id: storedId, sbu: storedSbu },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && Array.isArray(response.data.item)) {
        setRecentScans(response.data.item); // Menyimpan data dari API ke state
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching recent scans:', error);
    }
  };

  // Komponen tombol dengan animasi sentuhan
  const AnimatedIcon = ({ name, onPress }) => {
    const scaleValue = useRef(new Animated.Value(1)).current; // Menggunakan useRef untuk Animated.Value

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.iconWrapper}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Icon name={name} size={30} color="#fff" />
        </Animated.View>
      </Pressable>
    );
  };

  const handleAlert = () => {
   
      Alert.alert(
        "Attention",
        "Status is 'On Process'",
        [{ text: "OK", onPress: () => console.log("Alert Closed") }]
      );
   
  };

  // Fungsi untuk merender setiap item di FlatList
  const renderScanItem = ({ item }) => (
    <View style={styles.scanCard}>
      <Text style={styles.drugName}>{item.DrugName}</Text>
      <Text style={styles.drugDetails}>Item Code: {item.DrugID}</Text>
      <Text style={styles.drugDetails}>Hospital: {item.sbu}</Text>
      <Text style={styles.drugDetails}>Quantity: {item.Quantity}</Text>
      <Text style={styles.drugDetails}>Uom: {item.Uom}</Text>
      <Text style={styles.drugDetails}>
        Created At: {new Date(item.created_at).toLocaleString()}
      </Text>

      {/* Tambahkan kondisi untuk Status */}
      <View style={styles.statusContainer}>
        {item.Status === '2' ? (
          // Tampilkan ikon centang untuk status '2'
          <Icon name="check-circle" size={20} color="green" />
        ) : (
          // Jalankan fungsi handleAlert untuk status '1'
          <Text
            style={styles.alertText}
            onPress={handleAlert} // Klik untuk memicu alert
          >
            <Icon name="history" size={20} color="black" /> On Proses
          </Text>
        )}
      </View>
    </View>

  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('../../assets/images/bt1.jpg')}
          style={styles.reactLogo}
        />
      }>
      {/* Card untuk Tombol Navigasi */}
      
      <View style={styles.card}>
        <View style={styles.header}>
        <MaterialIcons name="account-circle" size={24} color="white" />
        <Text style={styles.balanceText}> {name}</Text>
      </View>
      <View style={styles.header2}>
        <MaterialIcons name="location-on" size={14} color="white" />
        <Text style={styles.balanceText2}> {sbu}</Text>
      </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Item"
          value={searchText}
          onChangeText={setSearchText}
          onPress={handleFocus} // Ketika input di klik, navigasi ke halaman search
          onBlur={() => setHasNavigated(false)}
        />
        <View style={styles.buttonRow}>
          
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('verifikasi/scanner')}>
            <MaterialIcons name="qr-code-scanner" size={32} color="white" />
            <Text style={styles.iconLabel}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/storage/storage_list')}>
            <MaterialIcons name="add-circle-outline" size={32} color="white" />
            <Text style={styles.iconLabel}>Storage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/userlist')} >
            <MaterialIcons name="receipt" size={32} color="white" />
            <Text style={styles.iconLabel}>Prescriptions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/history')}>
            <MaterialIcons name="history" size={32} color="white" />
            <Text style={styles.iconLabel}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card untuk Recent Scans */}
      <View style={styles.cardlist}>
        <Text style={styles.cardTitle}>Recent Scan</Text>

        {/* Menggunakan FlatList untuk melakukan scroll horizontal */}
        <FlatList
          data={recentScans}
          renderItem={renderScanItem}
          keyExtractor={(item) => `${item.OrderID}-${item.DrugID}`}
          horizontal={true} // Mengaktifkan scroll horizontal
          showsHorizontalScrollIndicator={false} // Menyembunyikan indikator scroll horizontal
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 278,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  card: {
    backgroundColor: 'rgba(52, 219, 235, 0.9)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    padding: 16,
    width: '100%',
    position: 'absolute',
    top: -160,
    zIndex: 99999,
    marginLeft: 10,
  },
  cardlist: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    padding: 16,
    width: '100%',
    marginTop: 60,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  scanCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginRight: 12, // Memberikan jarak antar card
    minWidth: 200, // Setel ukuran minimum untuk setiap card
    borderWidth: 1,
    borderColor: '#ddd',
  },
  drugName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  drugDetails: {
    fontSize: 14,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight:10,
    marginLeft:10,
  },
  iconWrapper: {
    margin: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  untuknama:{
    fontSize: 26,
    top: -120,
  },
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  header2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
   
  },
  balanceText2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  iconButton: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
});

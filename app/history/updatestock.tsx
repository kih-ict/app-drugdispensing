import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams,router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Updatestock() {
  const { code,ids } = useLocalSearchParams();
  const [number, setNumber] = useState('');
  const [remark, setRemark] = useState('');

  // Replace with your actual token
 

  const handleSave = async () => {
  const token = await AsyncStorage.getItem('userToken');
  const storedId = await AsyncStorage.getItem('userId');
  const storedSbu = await AsyncStorage.getItem('userSbu');
    try {
      const response = await axios.post(
        'https://medication.kih.co.id/api/storestocktake',
        {
          itemcode:code,
          stock:number,
          remark:remark,
          sbu:storedSbu,
          id:storedId,
          storage:ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Check for success response
      if (response.status === 200) {
        Alert.alert('Success', response.data.message, [
          {
            text: 'OK',
            onPress: () => router.push(`/history/stockcheck`), // Arahkan ke halaman berikutnya
          },
        ]);
      } else {
        Alert.alert('Error', 'Something went wrong, please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save data. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Code: {code}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter number"
        keyboardType="numeric"
        value={number}
        onChangeText={setNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter remark"
        value={remark}
        onChangeText={setRemark}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

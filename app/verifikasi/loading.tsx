import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useDrugStore } from '../../hooks/UseDrugStore'; // pastikan path ini sesuai

export default function LoadingPage() {
  const router = useRouter();
  const { prn } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const setDrugsGlobal = useDrugStore((state) => state.setDrugs);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
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

          // ⬇️ Simpan ke Zustand
          setDrugsGlobal(formattedDrugs);

          const allComplete = formattedDrugs.every((drug) => drug.status === '2');

          if (allComplete) {
            router.replace(`verifikasi/complate?prn=${formattedDrugs[0]?.patientPrn}&account_no=${formattedDrugs[0]?.patientAccount}`);
          } else {
            router.replace(`verifikasi/listobat?prn=${formattedDrugs[0]?.patientPrn}`);
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
      }
    };

    fetchDrugs();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00ff00" />
      <Text style={styles.text}>Processing PRN Data...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: 18 },
});

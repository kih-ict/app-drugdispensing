import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const EditLoket = () => {
  const router = useRouter();
  const  id  = router.query; // Tangkap parameter ID dari URL

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halaman Edit Loket</Text>
      <Text>ID yang diterima: {id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default EditLoket;

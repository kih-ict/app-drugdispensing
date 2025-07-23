import { useRouter } from 'expo-router';

export default function EditLoket() {
  const router = useRouter();
  const { id } = router.query; // Pastikan parameter 'id' diambil dari query

  console.log('Parameter ID:', id);

  return (
    <Text>Halaman Edit Loket, ID: {id}</Text>
  );
}

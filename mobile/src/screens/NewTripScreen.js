import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '../services/api';

const MATERIAL_OPTIONS = [
  { label: 'Entulho de construção', value: 'ENTULHO' },
  { label: 'Concreto', value: 'CONCRETO' },
  { label: 'Madeira', value: 'MADEIRA' },
  { label: 'Metal e ferragens', value: 'METAL' },
  { label: 'Plástico', value: 'PLASTICO' },
  { label: 'Material misto', value: 'MISTO' },
];

export default function NewTripScreen() {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedMaterial = MATERIAL_OPTIONS.find((option) => option.value === materialType);

  async function handleCreateTrip() {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await api.post('/trips/', {
        origin,
        destination,
        materialType,
        estimatedWeight: Number(estimatedWeight),
      });

      setSuccessMessage('Viagem criada com sucesso.');
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 800);
    } catch (error) {
      const message = error.response?.data?.message || 'Não foi possível criar a viagem.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextArea}>
            <Text style={styles.title}>Nova Viagem</Text>
            <Text style={styles.subtitle}>Preencha os dados da coleta</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Origem</Text>
          <TextInput
            style={styles.input}
            placeholder="Endereço de origem"
            placeholderTextColor="#9ca3af"
            value={origin}
            onChangeText={setOrigin}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            style={styles.input}
            placeholder="Endereço de destino"
            placeholderTextColor="#9ca3af"
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tipo de material</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setIsMaterialModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={selectedMaterial ? styles.selectText : styles.selectPlaceholder}>
              {selectedMaterial ? selectedMaterial.label : 'Selecione o material'}
            </Text>
            <Text style={styles.selectIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Peso estimado</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 8.5"
            placeholderTextColor="#9ca3af"
            value={estimatedWeight}
            onChangeText={setEstimatedWeight}
            keyboardType="numeric"
          />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateTrip}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Criar Viagem</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMaterialModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMaterialModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsMaterialModalVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity style={styles.modalContent} onPress={() => {}} activeOpacity={1}>
            <Text style={styles.modalTitle}>Selecione o material</Text>

            <FlatList
              data={MATERIAL_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = materialType === item.value;

                return (
                  <TouchableOpacity
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setMaterialType(item.value);
                      setIsMaterialModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  headerTextArea: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#f0fdf4',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  selectInput: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  selectText: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
  },
  selectPlaceholder: {
    color: '#9ca3af',
    flex: 1,
    fontSize: 16,
  },
  selectIcon: {
    color: '#4b5563',
    fontSize: 12,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  success: {
    color: '#16a34a',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    maxWidth: 420,
    padding: 16,
    width: '100%',
  },
  modalTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalOption: {
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  modalOptionText: {
    color: '#374151',
    fontSize: 15,
  },
  modalOptionTextSelected: {
    color: '#166534',
    fontWeight: '600',
  },
});

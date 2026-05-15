import { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import api from '../services/api';

const MATERIAL_LABELS = {
  ENTULHO: 'Entulho',
  CONCRETO: 'Concreto',
  MADEIRA: 'Madeira',
  METAL: 'Metal',
  PLASTICO: 'Plástico',
  MISTO: 'Misto',
};

export default function ConfirmDisposalScreen({ navigation, route }) {
  const trip = route.params?.trip || {};
  const [manualCode, setManualCode] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function formatMaterial(materialType) {
    return MATERIAL_LABELS[materialType] || materialType || 'Material não informado';
  }

  function formatWeight(weight) {
    if (weight === null || weight === undefined) {
      return 'Peso não informado';
    }

    return `${weight} ton`;
  }

  function handleSimulateQrCode() {
    setManualCode(`ECOTRUCK-${trip.id || 'VIAGEM'}-${Date.now()}`);
  }

  function handleSelectPhoto() {
    setPhotoSelected(true);
  }

  async function handleConfirmDisposal() {
    setErrorMessage('');
    setSuccessMessage('');

    if (!trip.id) {
      setErrorMessage('Viagem não identificada.');
      return;
    }

    if (!manualCode.trim()) {
      setErrorMessage('Informe ou simule o QR Code.');
      return;
    }

    if (!photoSelected) {
      setErrorMessage('Adicione ou simule uma foto do descarte.');
      return;
    }

    const formData = new FormData();
    formData.append('qrCodeValidation', manualCode.trim());
    formData.append('photoName', `descarte-${trip.id}.jpg`);
    formData.append('photo', {
      uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==',
      name: `descarte-${trip.id}.jpg`,
      type: 'image/jpeg',
    });

    setIsLoading(true);

    try {
      await api.post(`/trips/${trip.id}/confirm-disposal`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Descarte confirmado com sucesso.');
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 800);
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response?.data?.message || 'Não foi possível confirmar o descarte.');
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
            <Text style={styles.title}>Confirmar Descarte</Text>
            <Text style={styles.subtitle}>Viagem #{trip.id || '-'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo da Viagem</Text>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.originDot]} />
            <View style={styles.routeTextArea}>
              <Text style={styles.label}>Origem</Text>
              <Text style={styles.value}>{trip.origin || 'Sem origem'}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <View style={styles.routeTextArea}>
              <Text style={styles.label}>Destino</Text>
              <Text style={styles.value}>{trip.destination || 'Sem destino'}</Text>
            </View>
          </View>

          <View style={styles.summaryFooter}>
            <Text style={styles.summaryText}>{formatMaterial(trip.materialType)}</Text>
            <Text style={styles.summaryWeight}>{formatWeight(trip.estimatedWeight)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Foto do Descarte</Text>
            <Text style={styles.requiredText}>Obrigatório</Text>
          </View>

          <View style={styles.previewBox}>
            <View style={styles.previewIcon}>
              <Text style={styles.previewIconText}>F</Text>
            </View>
            <Text style={styles.previewTitle}>
              {photoSelected ? 'Imagem pronta para envio' : 'Imagem do descarte aparecerá aqui'}
            </Text>
            <Text style={styles.previewText}>
              {photoSelected ? 'Foto simulada selecionada' : 'Adicione uma imagem ou tire uma foto no local'}
            </Text>
          </View>

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSelectPhoto} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Adicionar imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSelectPhoto} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Tirar foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Validação do Local</Text>
            <Text style={styles.requiredText}>Obrigatório</Text>
          </View>

          <View style={styles.qrBox}>
            <View style={styles.qrIcon}>
              <Text style={styles.qrIconText}>QR</Text>
            </View>
            <Text style={styles.previewTitle}>Escanear QR Code</Text>
            <Text style={styles.previewText}>Código disponível no local de descarte</Text>
          </View>

          <TouchableOpacity style={styles.scanButton} onPress={handleSimulateQrCode} activeOpacity={0.8}>
            <Text style={styles.scanButtonText}>Escanear QR Code</Text>
          </TouchableOpacity>

          <View style={styles.manualCodeArea}>
            <Text style={styles.label}>Ou digite o código manualmente</Text>
            <TextInput
              style={styles.input}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Digite o código"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            A foto e o código QR serão usados para validar o descarte correto dos resíduos.
          </Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          onPress={handleConfirmDisposal}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmar Entrega</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
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
    padding: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  requiredText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
  },
  routeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 10,
    marginTop: 4,
    width: 12,
  },
  originDot: {
    backgroundColor: '#16a34a',
  },
  destinationDot: {
    backgroundColor: '#dc2626',
  },
  routeTextArea: {
    flex: 1,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 5,
  },
  value: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryFooter: {
    alignItems: 'center',
    borderTopColor: '#f3f4f6',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  summaryText: {
    color: '#374151',
    flex: 1,
    fontSize: 14,
    paddingRight: 12,
  },
  summaryWeight: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  previewBox: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    minHeight: 176,
    justifyContent: 'center',
    padding: 20,
  },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 10,
    width: 48,
  },
  previewIconText: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '700',
  },
  previewTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  previewText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '700',
  },
  qrBox: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    minHeight: 132,
    justifyContent: 'center',
    padding: 18,
  },
  qrIcon: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 10,
    width: 48,
  },
  qrIconText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '700',
  },
  scanButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    marginTop: 12,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  manualCodeArea: {
    marginTop: 14,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    height: 44,
    paddingHorizontal: 12,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  infoText: {
    color: '#1e40af',
    fontSize: 13,
    lineHeight: 19,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#16a34a',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});
